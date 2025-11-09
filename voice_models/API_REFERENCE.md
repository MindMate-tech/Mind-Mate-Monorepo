# Voice Dementia Detection API - Request & Response Reference

## Base URL
```
http://localhost:8000          # Local development
https://your-service.onrender.com  # Production (Render)
```

---

## Endpoint 1: Root/Info

### Request
```http
GET /
```

**No request body required**

### Example Request
```bash
curl http://localhost:8000/
```

### Response
```json
{
  "name": "Voice Dementia Detection API",
  "version": "1.0.0",
  "status": "running",
  "model_loaded": true,
  "endpoints": {
    "/": "API information",
    "/health": "Health check",
    "/predict": "Upload audio file for analysis (POST)",
    "/docs": "Interactive API documentation"
  }
}
```

**Response Fields:**
- `name` (string): API name
- `version` (string): API version
- `status` (string): Current status ("running")
- `model_loaded` (boolean): Whether the ML model is loaded
- `endpoints` (object): Available endpoints

---

## Endpoint 2: Health Check

### Request
```http
GET /health
```

**No request body required**

### Example Request
```bash
curl http://localhost:8000/health
```

### Response
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

**Response Fields:**
- `status` (string): Health status ("healthy")
- `model_loaded` (boolean): Whether the ML model is loaded
- `device` (string): Device used for inference ("cpu" or "cuda:0")

---

## Endpoint 3: Predict from File Upload

### Request
```http
POST /predict
Content-Type: multipart/form-data
```

**Request Body:**
- Form data with field name: `file`
- File types supported: MP3, WAV, FLAC, M4A, OGG, AAC

### Example Request (cURL)
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -F "file=@/path/to/audio.mp3"
```

### Example Request (Python)
```python
import requests

url = "http://localhost:8000/predict"
with open("audio.mp3", "rb") as f:
    files = {"file": f}
    response = requests.post(url, files=files)
    result = response.json()
    print(result)
```

### Example Request (JavaScript)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/predict', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Success Response (200 OK)
```json
{
  "status": "success",
  "result": "normal",
  "probabilities": {
    "normal": 0.7234,
    "normal_percentage": 72.34,
    "dementia": 0.2766,
    "dementia_percentage": 27.66
  },
  "confidence": 0.7234,
  "message": "Normal voice detected (72.34% confidence). The voice appears to be within normal range.",
  "audio_info": {
    "length_seconds": 45.23,
    "mfcc_features_shape": [4523, 13]
  },
  "note": "This is a screening tool and should not replace professional medical diagnosis."
}
```

**Response Fields:**
- `status` (string): Always "success" for successful requests
- `result` (string): Either `"normal"` or `"dementia_detected"`
- `probabilities` (object):
  - `normal` (float): Normal probability (0.0-1.0)
  - `normal_percentage` (float): Normal probability as percentage (0.0-100.0)
  - `dementia` (float): Dementia probability (0.0-1.0)
  - `dementia_percentage` (float): Dementia probability as percentage (0.0-100.0)
- `confidence` (float): Confidence level (0.0-1.0)
- `message` (string): Human-readable interpretation
- `audio_info` (object):
  - `length_seconds` (float): Audio duration in seconds
  - `mfcc_features_shape` (array): Shape of extracted MFCC features [frames, features]
- `note` (string): Medical disclaimer

**Result Values:**
- `"normal"`: Voice appears normal (dementia probability < 50%)
- `"dementia_detected"`: Possible signs of dementia (dementia probability ≥ 50%)

### Error Responses

**400 Bad Request - Unsupported File Type**
```json
{
  "detail": "Unsupported file type: .xyz. Allowed types: .mp3, .wav, .flac, .m4a, .ogg, .aac"
}
```

**500 Internal Server Error - Processing Error**
```json
{
  "detail": "Error processing audio: [error message]"
}
```

**503 Service Unavailable - Model Not Available**
```json
{
  "detail": "Model not available: [error message]"
}
```

---

## Endpoint 4: Predict from URL

### Request
```http
POST /predict/url
Content-Type: application/json
Authorization: Bearer <token>  # Optional, for authenticated URLs
```

**Request Body:**
```json
{
  "url": "https://example.com/audio.mp3"
}
```

### Example Request (cURL)
```bash
# Public URL
curl -X POST "http://localhost:8000/predict/url" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/audio.mp3"}'

# With Authorization (for Supabase or authenticated URLs)
curl -X POST "http://localhost:8000/predict/url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{"url": "https://your-project.supabase.co/storage/v1/object/public/bucket/audio.mp3"}'
```

### Example Request (Python)
```python
import requests

url = "http://localhost:8000/predict/url"
payload = {
    "url": "https://example.com/audio.mp3"
}
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token-here"  # Optional
}
response = requests.post(url, json=payload, headers=headers)
result = response.json()
print(result)
```

### Success Response (200 OK)
Same format as `/predict` endpoint:
```json
{
  "status": "success",
  "result": "normal",
  "probabilities": {
    "normal": 0.7234,
    "normal_percentage": 72.34,
    "dementia": 0.2766,
    "dementia_percentage": 27.66
  },
  "confidence": 0.7234,
  "message": "Normal voice detected (72.34% confidence). The voice appears to be within normal range.",
  "audio_info": {
    "length_seconds": 45.23,
    "mfcc_features_shape": [4523, 13]
  },
  "note": "This is a screening tool and should not replace professional medical diagnosis."
}
```

### Error Responses

**400 Bad Request - Invalid URL**
```json
{
  "detail": "Invalid URL format"
}
```

**401 Unauthorized - Invalid Token**
```json
{
  "detail": "Unauthorized: Invalid or missing authentication token. For Supabase, provide a valid Bearer token."
}
```

**403 Forbidden - Access Denied**
```json
{
  "detail": "Forbidden: Access denied. Check if the file is public or use a signed URL with proper authentication."
}
```

**404 Not Found - File Not Found**
```json
{
  "detail": "File not found at the provided URL."
}
```

**500 Internal Server Error**
```json
{
  "detail": "Error processing file from URL: [error message]"
}
```

**503 Service Unavailable - Model Not Available**
```json
{
  "detail": "Model not available: [error message]"
}
```

---

## Complete Example: Full Request/Response Flow

### Example 1: File Upload (Success)
```bash
# Request
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -F "file=@test_audio.mp3"

# Response (200 OK)
{
  "status": "success",
  "result": "normal",
  "probabilities": {
    "normal": 0.8234,
    "normal_percentage": 82.34,
    "dementia": 0.1766,
    "dementia_percentage": 17.66
  },
  "confidence": 0.8234,
  "message": "Normal voice detected (82.34% confidence). The voice appears to be within normal range.",
  "audio_info": {
    "length_seconds": 30.45,
    "mfcc_features_shape": [3045, 13]
  },
  "note": "This is a screening tool and should not replace professional medical diagnosis."
}
```

### Example 2: File Upload (Dementia Detected)
```bash
# Request
curl -X POST "http://localhost:8000/predict" \
  -F "file=@test_audio.mp3"

# Response (200 OK)
{
  "status": "success",
  "result": "dementia_detected",
  "probabilities": {
    "normal": 0.3421,
    "normal_percentage": 34.21,
    "dementia": 0.6579,
    "dementia_percentage": 65.79
  },
  "confidence": 0.6579,
  "message": "High dementia probability detected (65.79%). This suggests possible signs of dementia in the voice.",
  "audio_info": {
    "length_seconds": 28.12,
    "mfcc_features_shape": [2812, 13]
  },
  "note": "This is a screening tool and should not replace professional medical diagnosis."
}
```

### Example 3: Error - Unsupported File Type
```bash
# Request
curl -X POST "http://localhost:8000/predict" \
  -F "file=@document.pdf"

# Response (400 Bad Request)
{
  "detail": "Unsupported file type: .pdf. Allowed types: .mp3, .wav, .flac, .m4a, .ogg, .aac"
}
```

---

## Response Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | OK | Successful prediction |
| 400 | Bad Request | Invalid file type or malformed request |
| 401 | Unauthorized | Invalid/missing auth token (URL endpoint) |
| 403 | Forbidden | Access denied to URL resource |
| 404 | Not Found | File not found at URL |
| 500 | Internal Server Error | Processing error or server error |
| 503 | Service Unavailable | Model not loaded or unavailable |

---

## Supported Audio Formats

- **MP3** (`.mp3`)
- **WAV** (`.wav`)
- **FLAC** (`.flac`)
- **M4A** (`.m4a`)
- **OGG** (`.ogg`)
- **AAC** (`.aac`)

---

## Interactive Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

You can test all endpoints directly from these pages.

---

## Notes

1. **Medical Disclaimer**: This is a screening tool and should not replace professional medical diagnosis.

2. **Model Loading**: The model loads automatically on startup. If it fails, it will load on the first request.

3. **File Size**: There's no explicit file size limit, but very large files may cause timeouts.

4. **CORS**: CORS is enabled for all origins. For production, consider restricting this.

5. **Authentication**: Currently, the API has no authentication. For production use, add authentication middleware.

