"""
Configuration settings for Indic ASR.
"""
from pathlib import Path
import os

# Base paths
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

# Model Configuration
MODEL_NAME = "ai4bharat/indic-conformer-600m-multilingual"
DEFAULT_LANGUAGE = "hi"
DEFAULT_DECODER = "ctc"
SUPPORTED_DECODERS = ("ctc", "rnnt")
WARMUP_LANG = "hi"
WARMUP_DECODER = "ctc"
NUM_CPU_THREADS = os.cpu_count() or 4

# Audio Processing Parameters
SAMPLE_RATE = 16000
BLOCK_DURATION_SEC = 0.1  # 100 ms per block
BLOCK_SIZE = int(BLOCK_DURATION_SEC * SAMPLE_RATE)
ENERGY_THRESHOLD = 0.01   # Voice activity energy threshold
SILENCE_END_SECS = 0.8    # Silence duration (seconds) to detect end of sentence
MAX_UTTERANCE_SECS = 25   # Maximum speech duration before forcing transcription
MIN_UTTERANCE_SECS = 0.5  # Minimum speech duration to transcribe

# Server Configuration
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000
