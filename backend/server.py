from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import spacy
import numpy as np
import pytesseract
import re, os, time, json, uuid
from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------- Image Processing & OCR ----------

def image_processing(img, address=False):
    """Grayscale + thresholding for better OCR."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    if address:
        result = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 55, 17
        )
        kernel = np.ones((3, 2), np.uint8)
        result = cv2.erode(result, kernel, iterations=2)
    else:
        result = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 77, 17
        )
    return result


def get_address(img):
    """Extract address text."""
    processed = image_processing(img, address=True)
    text = pytesseract.image_to_string(processed, lang="eng", config="--psm 4 --oem 3")
    text = text.replace("Address:", "").replace("Address :", "")
    text = os.linesep.join([s for s in text.splitlines() if s.strip()])
    return text


def get_values(img):
    """Extract Aadhaar-like info (name, gender, dob, etc.)."""
    regex_name = regex_gender = regex_dob = regex_mobile = regex_aadhaar = None

    nlp = spacy.load("en_core_web_sm")
    processed = image_processing(img)
    ocr_text = pytesseract.image_to_string(processed, lang="eng", config="--psm 4 --oem 3")

    # Extract Name
    doc = nlp(ocr_text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            regex_name = ent.text
            break
    if not regex_name:
        possible_names = re.findall("[A-Z][a-z]+", ocr_text)
        regex_name = " ".join(possible_names[:2]) if possible_names else None

    # Extract Gender
    match = re.search(r"\b(MALE|FEMALE|Male|Female|male|female)\b", ocr_text)
    regex_gender = match.group(0) if match else None

    # Extract DOB
    match = re.search(r"\d{2}/\d{2}/\d{4}", ocr_text)
    regex_dob = match.group(0) if match else None

    # Extract Mobile
    match = re.search(r"\b\d{10}\b", ocr_text)
    regex_mobile = match.group(0) if match else None

    # Extract Aadhaar number
    match = re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", ocr_text)
    regex_aadhaar = match.group(0) if match else None

    return {
        "name": regex_name,
        "gender": regex_gender,
        "dob": regex_dob,
        "mobile": regex_mobile,
        "aadhaar": regex_aadhaar,
        "raw_text": ocr_text.strip(),
    }


# ---------- Flask API Routes ----------

@app.route("/api/ocr/extract", methods=["POST"])
def extract_text():
    """Main OCR endpoint."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    temp_name = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(UPLOAD_FOLDER, temp_name)
    file.save(temp_path)

    try:
        images = []
        if ext == ".pdf":
            pages = convert_from_path(temp_path, dpi=300)
            images = [np.array(page) for page in pages]
        else:
            img = cv2.imdecode(np.fromfile(temp_path, dtype=np.uint8), cv2.IMREAD_COLOR)
            images = [img]

        all_results = []
        for page_img in images:
            values = get_values(page_img)
            address = get_address(page_img)
            result = {
                "fields": {
                    "name": values["name"],
                    "gender": values["gender"],
                    "dob": values["dob"],
                    "mobile": values["mobile"],
                    "aadhaar": values["aadhaar"],
                    "address": address,
                },
                "text": values["raw_text"],
                "confidence": 0.85,
            }
            all_results.append(result)

        # If multiple pages, return list; else just one
        output = all_results[0] if len(all_results) == 1 else {"pages": all_results}

        # Optional: Save JSON for debugging
        json_name = f"ocr_result_{int(time.time())}.json"
        with open(os.path.join(UPLOAD_FOLDER, json_name), "w") as f:
            json.dump(output, f, indent=4)

        return jsonify(output)

    except Exception as e:
        print("❌ OCR Error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.route("/")
def home():
    return "Python OCR backend running ✅"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
