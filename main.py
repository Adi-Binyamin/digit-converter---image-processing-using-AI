from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import cv2

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

model = tf.keras.models.load_model('digit_model.h5')

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    
    # שימוש ב-Adaptive Threshold לדיוק מקסימלי בציור ידני
    thresh = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                   cv2.THRESH_BINARY_INV, 11, 2)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # מיון משמאל לימין
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])
    
    final_number = ""
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w > 5 and h > 5: # סינון רעשים מינימלי
            digit_img = thresh[y:y+h, x:x+w]
            
            # הוספת שוליים מאוזנים
            digit_img = cv2.copyMakeBorder(digit_img, 15, 15, 15, 15, cv2.BORDER_CONSTANT, value=0)
            digit_img = cv2.resize(digit_img, (28, 28))
            
            input_data = digit_img.astype('float32') / 255.0
            input_data = input_data.reshape(1, 28, 28, 1)
            
            prediction = model.predict(input_data)
            # לוקחים את הספרה עם ההסתברות הכי גבוהה
            final_number += str(np.argmax(prediction))
    
    return {"result": final_number}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)