from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from torchvision import models, transforms
import torch
from PIL import Image
import pinecone
import io
import numpy as np

# Initialize FastAPI app
app = FastAPI()

# Initialize Pinecone
pinecone.init(api_key="your-pinecone-api-key", environment="us-west1-gcp")

# Create or connect to a Pinecone index
index = pinecone.Index("image-embeddings")

# Load pre-trained ResNet model for feature extraction
model = models.resnet50(pretrained=True)
model.eval()

# Define image preprocessing pipeline
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Endpoint for uploading image and storing the embedding
@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    # Read the image file
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes))

    # Preprocess the image
    input_tensor = preprocess(img).unsqueeze(0)

    # Generate embedding using the ResNet model
    with torch.no_grad():
        embedding = model(input_tensor).numpy()

    # Convert the embedding to a 1D list for storage
    embedding_flattened = embedding.flatten().tolist()

    # Store the embedding in Pinecone
    metadata = {"filename": file.filename}
    index.upsert([(file.filename, embedding_flattened, metadata)])

    return JSONResponse(
        content={"message": "Image uploaded and embedding stored", "filename": file.filename},
        status_code=200,
    )

# Endpoint for searching similar images by embedding
@app.post("/search-similar/")
async def search_similar(file: UploadFile = File(...)):
    # Read the image file
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes))

    # Preprocess the image
    input_tensor = preprocess(img).unsqueeze(0)

    # Generate embedding using the ResNet model
    with torch.no_grad():
        embedding = model(input_tensor).numpy()

    # Convert the embedding to a 1D list for search
    embedding_flattened = embedding.flatten().tolist()

    # Search for similar items in the Pinecone database
    query_result = index.query(embedding_flattened, top_k=5, include_metadata=True)

    return JSONResponse(
        content={"message": "Similar images found", "results": query_result["matches"]},
        status_code=200,
    )

# To run the server:
# uvicorn app_name:app --reload
