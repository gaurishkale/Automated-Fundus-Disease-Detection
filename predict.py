import torch
from torchvision import transforms
from PIL import Image, ImageFile, UnidentifiedImageError

ImageFile.LOAD_TRUNCATED_IMAGES = False

# =========================
# Image Transform Pipeline
# =========================
transform = transforms.Compose([
    transforms.Resize((192, 192), antialias=True),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# =========================
# Prediction Function
# =========================
def predict_image(model, device, image_bytes, class_names, confidence_threshold=0.5):
    image_bytes.seek(0)

    try:
        image = Image.open(image_bytes)
        image.verify()
        image_bytes.seek(0)
        image = Image.open(image_bytes).convert("RGB")
    except UnidentifiedImageError:
        raise ValueError("Invalid image file. Please upload a valid fundus image.")
    except Exception as exc:
        raise ValueError("Corrupted or unsupported image file.") from exc

    image_tensor = transform(image).unsqueeze(0).to(device)

    with torch.inference_mode():
        with torch.amp.autocast(device_type=device.type, enabled=(device.type == "cuda")):
            outputs = model(image_tensor)
        logits = outputs.logits if hasattr(outputs, "logits") else outputs
        probabilities = torch.softmax(logits, dim=1)
        confidence, predicted_class = torch.max(probabilities, dim=1)

    confidence_value = confidence.item()
    predicted_index = predicted_class.item()

    if confidence_value < confidence_threshold:
        final_prediction = "Uncertain - Please consult specialist"
    else:
        final_prediction = class_names[predicted_index]

    return {
        "prediction": final_prediction,
        "confidence": round(confidence_value * 100, 2),
        "predicted_index": predicted_index,
        "predicted_label": class_names[predicted_index],
    }
