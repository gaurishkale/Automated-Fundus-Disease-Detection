import os
from dataclasses import dataclass


def _to_bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    model_path: str = os.getenv("MODEL_PATH", "best_convnextv2_fundus.pth")
    mapping_path: str = os.getenv("MAPPING_PATH", "disease_mapping.json")
    confidence_threshold: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))
    max_image_size_mb: int = int(os.getenv("MAX_IMAGE_SIZE_MB", "10"))
    max_concurrent_inferences: int = int(os.getenv("MAX_CONCURRENT_INFERENCES", "4"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    structured_logging: bool = _to_bool(os.getenv("STRUCTURED_LOGGING"), default=True)
    debug_prediction_index: bool = _to_bool(os.getenv("DEBUG_PREDICTION_INDEX"), default=False)
    performance_target_ms: float = float(os.getenv("PERFORMANCE_TARGET_MS", "500"))


settings = Settings()
