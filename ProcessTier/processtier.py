from PIL import Image
import pytesseract
import math
import os
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

def extract_text_from_image(image_path, event_type):
    pytesseract.pytesseract.tesseract_cmd = "./Tesseract-OCR/tesseract.exe"
    image = Image.open(image_path)
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