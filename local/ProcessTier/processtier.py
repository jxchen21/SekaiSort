from PIL import Image
import pytesseract
import math
import os
import shutil
import cv2
import numpy as np
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

def extract_text_from_image(image_path, event_type):
    pytesseract.pytesseract.tesseract_cmd = "C:/Program Files/Tesseract-OCR/tesseract.exe" # adjust to wherever tesseract is stored on your device
    image = Image.open(image_path)

    # Crop left region for rank
    rank_crop = image.crop((math.floor(0.025*image.width), math.floor(0.25*image.height), math.floor(0.12*image.width), math.floor(0.75*image.height)))

    # Check if there's a crown (look for gold, silver, or bronze colors)
    rank_cv = cv2.cvtColor(np.array(rank_crop), cv2.COLOR_RGB2BGR)

    # Gold crown (#cfb65a) - converted to HSV: H=45, S=56%, V=81%
    gold_mask = cv2.inRange(cv2.cvtColor(rank_cv, cv2.COLOR_BGR2HSV),
                           np.array([40, 100, 150]), np.array([50, 200, 220]))

    # Silver crown (#bdb6ca) - gray-purple, use RGB
    silver_mask = cv2.inRange(rank_cv,
                             np.array([170, 160, 180]), np.array([210, 200, 220]))

    # Bronze crown (#c88a63) - converted to HSV: H=20, S=51%, V=78%
    bronze_mask = cv2.inRange(cv2.cvtColor(rank_cv, cv2.COLOR_BGR2HSV),
                             np.array([15, 80, 150]), np.array([25, 180, 220]))

    crown_mask = cv2.bitwise_or(cv2.bitwise_or(gold_mask, silver_mask), bronze_mask)

    if cv2.countNonZero(crown_mask) > 50:  # Crown detected
        print("Crown")
        # Crop to center area of the rank region where number appears in crown
        crown_h, crown_w = rank_crop.height, rank_crop.width
        number_crop = rank_crop.crop((
            math.floor(crown_w * 0.3), math.floor(crown_h * 0.4),
            math.floor(crown_w * 0.6), crown_h
        ))
        number_crop.save(f"debug_crown_crop.png")
        rank = pytesseract.image_to_string(number_crop, config='--psm 10 -c tessedit_char_whitelist=123').strip()
    else:
        # Normal rank extraction
        rank = pytesseract.image_to_string(rank_crop, config='--psm 7').strip()

    try:
        rank = int(rank)
    except:
        print("❌ Error: Integer rank not found")
        return

    # Crop center region for name (unchanged)
    namex = 0
    if(event_type.lower() == "mara"):
        namex = math.floor(0.21*image.width)
    else:
        namex = math.floor(0.25*image.width)
    name_crop = image.crop((namex, 0, math.floor(0.6*image.width), math.floor(0.4*image.height)))
    username = pytesseract.image_to_string(name_crop, config='--psm 7').strip()

    return (rank, username)

def main():
    event_type = input("Enter event type (mara/cc): ")
    directory = os.fsencode("./input/")
    rank_list = []
    clear_directory("./output/")
    for file in os.listdir(directory):
        filename = os.fsdecode(file)
        extension = filename.split(".")[1]
        if(extension in ["png", "jpg"]):
            in_path = "./input/" + filename
            rank_list.append(extract_text_from_image(in_path, event_type))
    rank_list = sorted(rank_list, key=lambda x: x[0])
    with open("./output/sorted_list.txt", "w") as f:
        for i in rank_list:
            f.write(f"{i[0]}: {i[1]}\n")
        print("✅ Sorted list saved to output/sorted_list.txt")

if __name__=="__main__":
    main()