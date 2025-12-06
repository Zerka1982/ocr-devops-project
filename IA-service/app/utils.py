import base64
import io
from PIL import Image

def base64_to_image(b64_string: str):
    """Convert Base64 string to PIL Image."""
    try:
        image_bytes = base64.b64decode(b64_string)
        return Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise ValueError(f"Invalid Base64 image: {str(e)}")
