import base64
import json

with open("tests/sample.png", "rb") as f:
    b64_string = base64.b64encode(f.read()).decode()

payload = {
    "image": b64_string
}

with open("tests/test_request.json", "w") as f:
    json.dump(payload, f, indent=4)

print(" test_request.json generated successfully!")
