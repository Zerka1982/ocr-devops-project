from app import create_app
from flask import request, jsonify
from app.utils import base64_to_image
import pytesseract
from flask_cors import CORS

app = create_app()
CORS(app)

@app.route("/ocr", methods=["POST"])
def ocr():
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"error": "Missing 'image' field"}), 400

        image = base64_to_image(data["image"])
        text = pytesseract.image_to_string(image)

        return jsonify({
            "status": "success",
            "text": text.strip()
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.get("/")
def home():
    return {"message": "OCR service ready"}

if __name__ == "__main__":
    app.run(port=8001, host="0.0.0.0")
