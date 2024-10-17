from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from PIL import Image
from io import BytesIO
import tensorflow as tf
import os

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model once
MODEL = tf.keras.models.load_model("./dog_prediction_model.h5")

CLASS_NAMES = ["Demodecosis", "Pyoderma", "Scabies"]

@app.get("/ping")
async def ping():
    return "Hey, Hello!!!"

def read_file_as_image(data) -> np.ndarray:
    # Convert to image and then to a numpy array
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Limit the file size to avoid excessive memory usage
    MAX_FILE_SIZE = 2 * 1024 * 1024  # 5 MB limit
    file_data = await file.read()
    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size should be less than 5 MB")

    # Read and preprocess the image
    image = read_file_as_image(file_data)
    img_batch = np.expand_dims(image, 0)

    # Run prediction
    predictions = MODEL.predict(img_batch)
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])

    # Explicitly delete variables to free memory
    del image, img_batch, file_data, predictions

    # Return prediction response
    return {
        'class': predicted_class,
        'confidence': float(confidence)
    }

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)
