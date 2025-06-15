from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import math
import os
import io
import shutil
import json

app = Flask(__name__, static_folder='static')
CORS(app)

@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message':'Hello world!'
    })

@app.route('/api/sort-images', methods=['POST'])
def sort_multiple_images():
    from PIL import Image
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400

    files = request.files.getlist('images')
    files_data = json.loads(request.form['data'])
    results = []
    upload_dir = 'static/uploads'
    if os.path.exists(upload_dir):
        shutil.rmtree(upload_dir)
    os.makedirs(upload_dir, exist_ok=True)

    for file in files:
        if file.filename == '':
            continue
        file.seek(0)
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        image_path = os.path.join(upload_dir, file.filename)
        image.save(image_path)
    for file_data in files_data:
        results.append({
            'filename': file_data.get('filename'),
            'rank' : int(file_data.get('rank')),
            'user' : file_data.get('user'),
            'image_url' : file_data.get('image_url')
       })
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

@app.route('/api/clean-images', methods=['POST'])
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
        extract_inside_static_pink(image, os.path.join(output_dir, f"{file.filename}.png"))
        results.append({
            'image_url' : f'/static/outputs/{file.filename}.png'
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