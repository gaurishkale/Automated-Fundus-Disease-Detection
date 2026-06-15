# Backend Validation and Stress-Test Workflow

This workflow validates correctness, robustness, and performance of the FastAPI inference backend.

## 1) Start the API in test mode

Set temporary debug/timing environment variables:

```powershell
$env:DEBUG_PREDICTION_INDEX="1"
$env:LOG_LEVEL="INFO"
$env:STRUCTURED_LOGGING="1"
$env:PERFORMANCE_TARGET_MS="500"
uvicorn main:app --host 0.0.0.0 --port 8000
```

Expected startup logs:
- `class_mapping_verified`
- `startup_completed` (contains `model_load_ms`, `device`, and class count)

## 2) Manual single-image validation

Use one known fundus image from your validation set.

### curl request

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/absolute/path/to/sample_fundus.jpg"
```

Expected success response format:

```json
{
  "status": "success",
  "prediction": "Glaucoma",
  "confidence": 92.41
}
```

### Postman request

- Method: `POST`
- URL: `http://127.0.0.1:8000/predict`
- Body: `form-data`
  - Key: `file` (type: `File`)
  - Value: select fundus image
- Header: `Accept: application/json`

### Swagger (`/docs`) test

- Open `http://127.0.0.1:8000/docs`
- Expand `POST /predict`
- Click `Try it out`
- Upload image and run
- Confirm response schema and values

## 3) Accuracy verification (label alignment and class index)

1. Check `disease_mapping.json` index-to-label mapping.
2. Send a known image with expected class from your validation dataset.
3. Inspect API logs for `prediction_debug` event:
   - `predicted_index`
   - `predicted_label`
4. Verify:
   - Index matches the expected mapping key.
   - Label string matches mapping value exactly.
   - API response `prediction` matches expected disease (or `Uncertain...` if confidence is below threshold).

## 4) Performance testing

Per-request timing sources:
- Response header: `X-Process-Time-Ms` (full request path time)
- Log event: `inference_completed` (`inference_ms` model-only inference path)

### Quick latency check (PowerShell loop)

```powershell
1..20 | ForEach-Object {
  curl.exe -s -X POST "http://127.0.0.1:8000/predict" `
    -F "file=@C:\absolute\path\sample_fundus.jpg" `
    -o NUL -D -
}
```

Target:
- On GPU path, monitor `inference_ms` and aim for `< 500 ms`.

## 5) Stability/negative tests

### Invalid file type (text file)

```bash
curl -X POST "http://127.0.0.1:8000/predict" -F "file=@notes.txt"
```

Expected: HTTP 400 with `Only image files are allowed.`

### Corrupted image file

```bash
curl -X POST "http://127.0.0.1:8000/predict" -F "file=@corrupted.jpg"
```

Expected: HTTP 400 with safe image validation error.

### Empty file

```bash
curl -X POST "http://127.0.0.1:8000/predict" -F "file=@empty.jpg"
```

Expected: HTTP 400 `Uploaded file is empty.` (or invalid image error if file metadata is malformed)

## 6) Concurrent stress test (basic)

Use two shells and run requests in parallel, or use your load tool of choice (`k6`, `Locust`, `JMeter`).
Track:
- Error rate
- p95 latency
- Throughput
- Any 5xx responses

## 7) Future monitoring readiness

Already available:
- Structured JSON logs
- Startup/model load timing
- Per-request timing header
- Inference timing logs

Next optional step:
- Add Prometheus metrics endpoint when integrating production observability stack.
