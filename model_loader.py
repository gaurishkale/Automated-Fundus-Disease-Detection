import torch
from transformers import AutoConfig, ConvNextV2Config, ConvNextV2ForImageClassification


def _normalize_state_dict_keys(state_dict):
    if not isinstance(state_dict, dict) or not state_dict:
        return state_dict

    sample_key = next(iter(state_dict.keys()))
    normalized = state_dict

    if sample_key.startswith("module."):
        normalized = {key.replace("module.", "", 1): value for key, value in normalized.items()}
    elif sample_key.startswith("model."):
        normalized = {key.replace("model.", "", 1): value for key, value in normalized.items()}

    return normalized


def _extract_state_dict(checkpoint):
    if isinstance(checkpoint, dict):
        for key in ("state_dict", "model_state_dict", "model"):
            value = checkpoint.get(key)
            if isinstance(value, dict):
                return value
    return checkpoint


def _build_convnextv2_tiny_config(num_classes):
    try:
        base_config = AutoConfig.from_pretrained(
            "facebook/convnextv2-tiny-1k-224",
            local_files_only=True,
        )
        if not isinstance(base_config, ConvNextV2Config):
            raise ValueError("Unexpected config type for ConvNeXtV2.")
    except Exception:
        # Fallback: canonical ConvNeXtV2-Tiny architecture (no network dependency).
        base_config = ConvNextV2Config(
            num_channels=3,
            image_size=224,
            hidden_sizes=[96, 192, 384, 768],
            depths=[3, 3, 9, 3],
            drop_path_rate=0.0,
            layer_norm_eps=1e-6,
            initializer_range=0.02,
        )

    base_config.num_labels = num_classes
    return base_config


def load_model(model_path, num_classes):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    config = _build_convnextv2_tiny_config(num_classes)
    model = ConvNextV2ForImageClassification(config)

    checkpoint = torch.load(model_path, map_location="cpu")
    state_dict = _extract_state_dict(checkpoint)
    state_dict = _normalize_state_dict_keys(state_dict)
    model.load_state_dict(state_dict, strict=True)
    model.to(device)
    model.eval()
    if device.type == "cuda":
        torch.backends.cudnn.benchmark = True

    return model, device
