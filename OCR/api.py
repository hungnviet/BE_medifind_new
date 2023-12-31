from fastapi import FastAPI, UploadFile, File
import cv2
import pytesseract
import numpy as np
import io
from PIL import Image

app = FastAPI()

@app.post("/process_image/")
async def process_image(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    img = cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)

    boxes = pytesseract.image_to_data(img)
    
    results = []
    for x, b in enumerate(boxes.splitlines()):
        if x != 0:
            b = b.split()
            if len(b) == 12:
                results.append(b[11])
    return {"results": results}