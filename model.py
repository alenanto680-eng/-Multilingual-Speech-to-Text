"""
ASR Model wrapper for AI4Bharat IndicConformer.
Handles model loading, device/thread optimization, warmup, and thread-safe inference.
"""
import os
import threading
import time
from typing import Optional, Tuple, Union

import numpy as np
import torch
from transformers import AutoModel

from config import (
    MODEL_NAME,
    NUM_CPU_THREADS,
    SAMPLE_RATE,
    WARMUP_LANG,
    WARMUP_DECODER,
    DEFAULT_LANGUAGE,
    DEFAULT_DECODER,
    SUPPORTED_DECODERS,
)


class IndicASR:
    """
    Wrapper around AI4Bharat's IndicConformer multilingual model.
    Provides thread-safe inference for both web servers and real-time streaming scripts.
    """

    def __init__(
        self,
        model_name: str = MODEL_NAME,
        num_threads: Optional[int] = None,
    ):
        self.model_name = model_name
        self.num_threads = num_threads or NUM_CPU_THREADS
        self._lock = threading.Lock()
        self.model = None

    def load(self):
        """
        Loads model weights into memory and runs a warm-up inference pass.
        """
        if self.model is not None:
            return self

        torch.set_num_threads(self.num_threads)
        print(f"Loading model '{self.model_name}' (using {self.num_threads} CPU threads)...")
        self.model = AutoModel.from_pretrained(
            self.model_name,
            trust_remote_code=True,
        )
        self._warmup()
        print("ASR Model is ready.")
        return self

    def _warmup(self):
        """
        Runs an initial dummy inference to prevent latency spikes on the first user request.
        """
        try:
            with torch.inference_mode():
                dummy = torch.zeros(1, SAMPLE_RATE)
                self.model(dummy, WARMUP_LANG, WARMUP_DECODER)
        except Exception as exc:
            print(f"Warm-up skipped: {exc}")

    def transcribe(
        self,
        wav: torch.Tensor,
        lang: str = DEFAULT_LANGUAGE,
        mode: str = DEFAULT_DECODER,
    ) -> Tuple[str, float]:
        """
        Transcribes a 2D float32 audio Tensor [1, num_samples] sampled at 16kHz.
        Returns a tuple of (transcription_text, execution_time_in_seconds).
        """
        if self.model is None:
            self.load()

        if mode not in SUPPORTED_DECODERS:
            mode = DEFAULT_DECODER

        start_time = time.time()
        with self._lock, torch.inference_mode():
            output = self.model(wav, lang, mode)

        if isinstance(output, (list, tuple)):
            output = " ".join(map(str, output))

        elapsed_sec = round(time.time() - start_time, 2)
        return str(output).strip(), elapsed_sec

    def transcribe_numpy(
        self,
        audio_array: np.ndarray,
        lang: str = DEFAULT_LANGUAGE,
        mode: str = DEFAULT_DECODER,
    ) -> Tuple[str, float]:
        """
        Convenience method to transcribe a 1D numpy float32 audio array.
        """
        wav = torch.from_numpy(audio_array.copy()).unsqueeze(0)
        return self.transcribe(wav, lang=lang, mode=mode)


# Global singleton instance for easy import across modules
asr_engine = IndicASR()
