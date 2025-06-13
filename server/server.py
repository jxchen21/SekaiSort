from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import pytesseract
import math
import os
import io

app = Flask(__name__, static_folder='static')
CORS(app,
     origins=["http://localhost:3000"],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message':'Hello world!'
    })

def extract_text_from_image(image, event_type):
    pytesseract.pytesseract.tesseract_cmd = "C:/Program Files/Tesseract-OCR/tesseract.exe" # adjust to wherever tesseract is stored on your device
    # Crop left region for rank
    rank_crop = image.crop((math.floor(0.025*image.width), math.floor(0.25*image.height), math.floor(0.12*image.width), math.floor(0.75*image.height)))  # adjust as needed
    rank = pytesseract.image_to_string(rank_crop, config='--psm 7').strip()
    try:
        rank = int(rank)
    except:
        print("❌ Error: Integer rank not found")
        return
    # Crop center region for name
    namex = 0
    if(event_type.lower() == "mara"):
        namex = math.floor(0.21*image.width)
    else:
        namex = math.floor(0.25*image.width)
    name_crop = image.crop((namex, 0, math.floor(0.6*image.width), math.floor(0.4*image.height)))  # adjust as needed
    username = pytesseract.image_to_string(name_crop, config='--psm 7').strip()
    return (rank, username)

@app.route('/api/sort-images', methods=['POST'])
def sort_multiple_images():
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400

    event_type = request.form.get('eventType')
    files = request.files.getlist('images')
    results = []

    upload_dir = 'static/uploads'
    os.makedirs(upload_dir, exist_ok=True)

    for file in files:
        if file.filename == '':
            continue
        file.seek(0)
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        result = extract_text_from_image(image, event_type)
        image_path = os.path.join(upload_dir, file.filename)
        image.save(image_path)
        results.append({
            'filename': file.filename,
            'tier': result[0],
            'user': result[1],
            'image_url': f'/static/uploads/{file.filename}'
        })

    results = sorted(results, key = lambda x: x['tier'])

    return jsonify(results)

@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('static/uploads', filename)

@app.route('/api/clean-images', methods=['POST'])
def clean_images():
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400
    files = request.files.getlist('images')
    results = []

    upload_dir = 'static/uploads'
    os.makedirs(upload_dir, exist_ok=True)

    for file in files:
        print('')
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True, port=8080)