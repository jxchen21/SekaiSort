# Program courtesy of @fraxel
# https://stackoverflow.com/questions/11287402/how-to-round-corner-a-logo-without-white-backgroundtransparent-on-it-using-pi

from PIL import Image, ImageDraw
import numpy as np
from scipy.ndimage import binary_fill_holes
import os
import math
import shutil

def clear_directory(dir_path):
    for filename in os.listdir(dir_path):
        file_path = os.path.join(dir_path, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)  # remove file or link
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)  # remove directory and all contents
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

def add_corners(image_path, rad):
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
    image = Image.open(image_path).convert("RGBA")
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
    print(f"✅ Cropped image saved to: {output_path}")




directory = os.fsencode("./input/")
clear_directory("./output/")
counter = 1
for file in os.listdir(directory):
    filename = os.fsdecode(file)
    extension = filename.split(".")[1]
    if(extension in ["png", "jpg"]):
        out_path = "./output/" + "tier_img" + str(counter) + ".png"
        extract_inside_static_pink(
            "./input/" + filename,
            out_path,
        )
        counter+=1