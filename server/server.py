from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import math
import os
import io
import shutil
import json
import re

app = Flask(__name__, static_folder='static')
CORS(app)

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "working"})

@app.route('/api/detect-crown', methods=['POST'])
def detect_crown():
    import cv2
    import numpy as np
    import base64
    from io import BytesIO
    from PIL import Image
    # Get image from request
    image_data = request.json['image']  # base64 encoded

    # Decode image
    image_bytes = base64.b64decode(image_data.split(',')[1])
    image = Image.open(BytesIO(image_bytes))

    # Use your existing crop logic
    rank_crop = image.crop((
        math.floor(0.025*image.width),
        math.floor(0.25*image.height),
        math.floor(0.12*image.width),
        math.floor(0.75*image.height)
    ))

    # Check for crown (your existing logic)
    rank_cv = cv2.cvtColor(np.array(rank_crop), cv2.COLOR_RGB2BGR)

    gold_mask = cv2.inRange(cv2.cvtColor(rank_cv, cv2.COLOR_BGR2HSV),
                           np.array([40, 100, 150]), np.array([50, 200, 220]))
    silver_mask = cv2.inRange(rank_cv,
                             np.array([170, 160, 180]), np.array([210, 200, 220]))
    bronze_mask = cv2.inRange(cv2.cvtColor(rank_cv, cv2.COLOR_BGR2HSV),
                             np.array([15, 80, 150]), np.array([25, 180, 220]))

    crown_mask = cv2.bitwise_or(cv2.bitwise_or(gold_mask, silver_mask), bronze_mask)
    has_crown = cv2.countNonZero(crown_mask) > 50
    return jsonify({'hasCrown': has_crown})

@app.route('/api/sort-tiers', methods=['POST'])
def sort_multiple_images():
    from PIL import Image
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400

    files = request.files.getlist('images')
    files_data = json.loads(request.form['data'])
    results = []

    output_dir = 'static/outputs'
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir, exist_ok=True)

    for file in files:
        if file.filename == '':
            continue
        file.seek(0)
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        save_name = ""
        for file_data in files_data:
            if (file_data.get('filename') == file.filename):
                save_name=f"t{file_data.get('rank')}_{file_data.get('user')}.png"
                save_name = re.sub(r'[\\/:*?"<>|#]', '_', save_name)
                results.append({
                    'filename': save_name,
                    'rank' : int(file_data.get('rank')),
                    'user' : file_data.get('user'),
                    'image_url' : f"/{output_dir}/{save_name}"
                })
                break
        image_path = os.path.join(output_dir, save_name)
        image.save(image_path)
    results = sorted(results, key = lambda x: x['rank'])
    return jsonify(results)

@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('static/uploads', filename)

def add_corners(image_path, rad):
    from PIL import Image, ImageDraw
    circle = Image.new('L', (rad * 2, rad * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, rad * 2 - 1, rad * 2 - 1), fill=255)
    alpha = Image.new('L', image_path.size, 255)
    w, h = image_path.size
    alpha.paste(circle.crop((0, 0, rad, rad)), (0, 0))
    alpha.paste(circle.crop((0, rad, rad, rad * 2)), (0, h - rad))
    alpha.paste(circle.crop((rad, 0, rad * 2, rad)), (w - rad, 0))
    alpha.paste(circle.crop((rad, rad, rad * 2, rad * 2)), (w - rad, h - rad))
    image_path.putalpha(alpha)
    return image_path

def extract_inside_static_pink(image_path, output_path, pink_rgb=[225,128,168], tolerance=30):
    import numpy as np
    image = image_path.convert("RGBA")
    data = np.array(image)

    # Create a mask of all pixels matching the pink border color
    pink_mask = (
        (np.abs(data[:, :, 0] - pink_rgb[0]) < tolerance) &
        (np.abs(data[:, :, 1] - pink_rgb[1]) < tolerance) &
        (np.abs(data[:, :, 2] - pink_rgb[2]) < tolerance)
    )
    pink_coords = np.argwhere(pink_mask)

    if pink_coords.size == 0:
        print("❌ No pink border pixels found — check color and tolerance.")
        return

    # Find bounding box of pink region
    y_pink, x_pink = pink_coords[:, 0], pink_coords[:, 1]
    top, bottom = y_pink.min(), y_pink.max()
    left, right = x_pink.min(), x_pink.max()

    # Crop just inside the pink border
    cropped = image.crop((left + 1, top + 1, right, bottom))
    cropped = add_corners(cropped, math.floor(cropped.size[1]*0.15))
    cropped.save(output_path)

@app.route('/api/clean-tiers', methods=['POST'])
def clean_images():
    from PIL import Image
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400
    files = request.files.getlist('images')
    results = []

    output_dir = 'static/outputs'
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir, exist_ok=True)

    counter = 0
    for file in files:
        if file.filename == '':
            continue
        file.seek(0)
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        extract_inside_static_pink(image, os.path.join(output_dir, f"{file.filename}"))
        results.append({
            'image_url' : f'/static/outputs/{file.filename}'
        })
        counter += 1
    return jsonify(results)

@app.route('/static/outputs/<filename>')
def output_file(filename):
    return send_from_directory('static/outputs', filename)

@app.route('/api/download/all', methods=['GET'])
def download_all():
    import zipfile
    memory_file = io.BytesIO()
    output_dir = 'static/outputs'
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        for filename in os.listdir(output_dir):
            file_path = os.path.join(output_dir, filename)
            if os.path.isfile(file_path):
                zf.write(file_path, filename)

    memory_file.seek(0)

    return send_file(
        memory_file,
        as_attachment=True,
        download_name='processed_images.zip',
        mimetype='application/zip'
    )

if __name__ == "__main__":
    #app.run(debug=True, port=8080)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)