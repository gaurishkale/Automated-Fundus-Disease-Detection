import asyncio
import json
import logging
from contextlib import asynccontextmanager
from io import BytesIO
from time import perf_counter
from typing import Any

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

from config import settings
from model_loader import load_model
from predict import predict_image

from chatbot.chatbot_api import router as chatbot_router
from chatbot.llm_service import shutdown_client as shutdown_chatbot_client


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "event"):
            payload["event"] = record.event
        if hasattr(record, "metadata"):
            payload["metadata"] = record.metadata
        return json.dumps(payload, ensure_ascii=True)


def setup_logging() -> None:
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(settings.log_level.upper())

    handler = logging.StreamHandler()
    if settings.structured_logging:
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s"))
    root_logger.addHandler(handler)


setup_logging()
logger = logging.getLogger("fundus-api")


def load_class_names(mapping_path: str) -> list[str]:
    with open(mapping_path, "r", encoding="utf-8") as mapping_file:
        disease_mapping = json.load(mapping_file)

    if isinstance(disease_mapping, dict):
        indexed_labels = sorted(((int(index), label) for index, label in disease_mapping.items()), key=lambda x: x[0])
        expected_indices = list(range(len(indexed_labels)))
        actual_indices = [index for index, _ in indexed_labels]
        if actual_indices != expected_indices:
            raise ValueError(
                "Disease mapping keys must be contiguous numeric indices starting at 0."
            )
        class_names = [label for _, label in indexed_labels]
    elif isinstance(disease_mapping, list):
        class_names = disease_mapping
    else:
        raise ValueError("Disease mapping must be a JSON list or dict.")

    if not class_names or any(not isinstance(label, str) or not label.strip() for label in class_names):
        raise ValueError("Disease mapping contains invalid class labels.")

    if len(set(class_names)) != len(class_names):
        raise ValueError("Disease mapping contains duplicate class labels.")

    logger.info(
        "Class mapping alignment verified.",
        extra={
            "event": "class_mapping_verified",
            "metadata": {"class_count": len(class_names), "class_names": class_names},
        },
    )
    return class_names


@asynccontextmanager
async def lifespan(app_obj: FastAPI):
    startup_begin = perf_counter()
    class_names = load_class_names(settings.mapping_path)

    model_load_begin = perf_counter()
    model, device = load_model(
        model_path=settings.model_path,
        num_classes=len(class_names),
    )
    model_load_ms = round((perf_counter() - model_load_begin) * 1000, 2)
    startup_ms = round((perf_counter() - startup_begin) * 1000, 2)

    app_obj.state.class_names = class_names
    app_obj.state.model = model
    app_obj.state.device = device
    app_obj.state.inference_semaphore = asyncio.Semaphore(settings.max_concurrent_inferences)

    logger.info(
        "Startup completed.",
        extra={
            "event": "startup_completed",
            "metadata": {
                "device": device.type,
                "class_count": len(class_names),
                "model_load_ms": model_load_ms,
                "startup_ms": startup_ms,
            },
        },
    )
    yield
    await shutdown_chatbot_client()
    logger.info("Shutting down Fundus API", extra={"event": "shutdown"})


app = FastAPI(
    title="Fundus Disease Classification API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router)


@app.middleware("http")
async def request_timing_middleware(request: Request, call_next):
    begin = perf_counter()
    response = await call_next(request)
    process_ms = round((perf_counter() - begin) * 1000, 2)
    response.headers["X-Process-Time-Ms"] = str(process_ms)
    logger.info(
        "Request completed.",
        extra={
            "event": "request_completed",
            "metadata": {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_ms": process_ms,
            },
        },
    )
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, str) else "Request failed."
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": detail},
    )


@app.exception_handler(RequestValidationError)
async def request_validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"status": "error", "message": "Validation error", "details": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server error: %s", str(exc))
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal server error"},
    )


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(content) > settings.max_image_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"Image exceeds {settings.max_image_size_mb}MB limit.",
        )

    image_bytes = BytesIO(content)

    async with app.state.inference_semaphore:
        try:
            inference_begin = perf_counter()
            result = await run_in_threadpool(
                predict_image,
                app.state.model,
                app.state.device,
                image_bytes,
                app.state.class_names,
                settings.confidence_threshold,
            )
            inference_ms = round((perf_counter() - inference_begin) * 1000, 2)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    if settings.debug_prediction_index:
        logger.info(
            "Prediction debug data.",
            extra={
                "event": "prediction_debug",
                "metadata": {
                    "predicted_index": result["predicted_index"],
                    "predicted_label": result["predicted_label"],
                    "confidence": result["confidence"],
                },
            },
        )

    logger.info(
        "Inference completed.",
        extra={
            "event": "inference_completed",
            "metadata": {
                "inference_ms": inference_ms,
                "device": app.state.device.type,
                "confidence": result["confidence"],
            },
        },
    )

    if app.state.device.type == "cuda" and inference_ms > settings.performance_target_ms:
        logger.warning(
            "Inference exceeded performance target on GPU.",
            extra={
                "event": "inference_slow_gpu",
                "metadata": {
                    "inference_ms": inference_ms,
                    "target_ms": settings.performance_target_ms,
                },
            },
        )

    return {
        "status": "success",
        "prediction": result["prediction"],
        "confidence": result["confidence"],
    }


@app.get("/")
async def home() -> dict[str, str]:
    return {"message": "Fundus Disease Classification API Running"}


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "model_loaded": bool(getattr(app.state, "model", None)),
        "device": app.state.device.type,
        "class_count": len(app.state.class_names),
    }
