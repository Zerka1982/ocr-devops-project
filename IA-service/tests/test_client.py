import requests
import json

with open("tests/test_request.json") as f:
    payload = json.load(f)

res = requests.post("http://localhost:8001/ocr", json=payload)

print("Status:", res.status_code)
print("Response:", res.json())
