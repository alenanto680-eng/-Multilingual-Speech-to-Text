"""
FastAPI Web Server for Indic Speech-to-Text.
Serves the web interface and handles audio transcription requests.
"""
from contextlib import asynccontextmanager
import numpy as np
from fastapi import FastAPI, Request, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.concurrency import run_in_threadpool

from config import (
    STATIC_DIR,
    TEMPLATES_DIR,
    DEFAULT_LANGUAGE,
    DEFAULT_DECODER,
    SERVER_HOST,
    SERVER_PORT,
    MODEL_NAME,
)
from model import asr_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eagerly load and warm-up the model during startup
    asr_engine.load()
    yield


app = FastAPI(
    title="Bolo · Indic Speech to Text",
    description="FastAPI service for real-time multilingual Indic ASR",
    lifespan=lifespan,
)

# Mount static assets
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", response_class=FileResponse)
async def index():
    """
    Renders the web client user interface.
    """
    return FileResponse(TEMPLATES_DIR / "index.html")


@app.post("/transcribe")
async def transcribe(
    request: Request,
    lang: str = Query(DEFAULT_LANGUAGE, description="Language code (e.g., 'hi', 'ta', 'te')"),
    mode: str = Query(DEFAULT_DECODER, description="Decoder architecture ('ctc' or 'rnnt')"),
):
    """
    Transcribes raw PCM float32 16kHz audio sent in the request body.
    """
    raw_bytes = await request.body()
    if not raw_bytes:
        return JSONResponse({"text": "", "secs": 0.0, "error": "Empty audio payload"}, status_code=400)

    audio = np.frombuffer(raw_bytes, dtype=np.float32).copy()
    if len(audio) == 0:
        return JSONResponse({"text": "", "secs": 0.0, "error": "Invalid audio data"}, status_code=400)

    text, secs = await run_in_threadpool(asr_engine.transcribe_numpy, audio, lang, mode)
    return {"text": text, "secs": secs}


@app.get("/health")
async def health():
    """
    Health check endpoint reporting service and model readiness.
    """
    return {
        "status": "ok",
        "model_loaded": asr_engine.model is not None,
        "model_name": MODEL_NAME,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host=SERVER_HOST, port=SERVER_PORT, reload=False)