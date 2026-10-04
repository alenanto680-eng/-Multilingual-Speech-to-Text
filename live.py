"""
Live Microphone Speech-to-Text CLI.
Captures microphone audio in real time, detects voice activity, and transcribes using Indic ASR.
"""
import argparse
import collections
import queue
import sys
import numpy as np
import sounddevice as sd

from config import (
    DEFAULT_LANGUAGE,
    DEFAULT_DECODER,
    SAMPLE_RATE,
    BLOCK_SIZE,
    ENERGY_THRESHOLD,
    SILENCE_END_SECS,
    MAX_UTTERANCE_SECS,
    MIN_UTTERANCE_SECS,
)
from model import asr_engine


def parse_args():
    parser = argparse.ArgumentParser(
        description="Live Indic Speech-to-Text from microphone"
    )
    parser.add_argument(
        "--lang",
        type=str,
        default=DEFAULT_LANGUAGE,
        help="Language code (e.g., hi, ta, te, bn, mr, ml, kn, gu, pa). Default: hi",
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["ctc", "rnnt"],
        default="rnnt",
        help="Decoder mode ('ctc' or 'rnnt'). Default: rnnt",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=ENERGY_THRESHOLD,
        help="RMS energy threshold for voice activity detection. Default: 0.01",
    )
    parser.add_argument(
        "--silence-end",
        type=float,
        default=SILENCE_END_SECS,
        help="Duration of silence (in seconds) that marks end of sentence. Default: 0.8",
    )
    parser.add_argument(
        "--max-seconds",
        type=float,
        default=MAX_UTTERANCE_SECS,
        help="Max audio duration before forcing transcription. Default: 25",
    )
    return parser.parse_args()


def run_live_transcription(
    lang: str = DEFAULT_LANGUAGE,
    mode: str = "rnnt",
    threshold: float = ENERGY_THRESHOLD,
    silence_end: float = SILENCE_END_SECS,
    max_seconds: float = MAX_UTTERANCE_SECS,
):
    # Ensure model is initialized
    asr_engine.load()

    audio_queue = queue.Queue()

    def audio_callback(indata, frames, time_info, status):
        if status:
            print(f"[Audio Warning]: {status}", file=sys.stderr)
        audio_queue.put(indata[:, 0].copy())

    def transcribe_utterance(chunks):
        audio = np.concatenate(chunks)
        text, secs = asr_engine.transcribe_numpy(audio, lang=lang, mode=mode)
        if text:
            print(f"[{secs}s] >> {text}")

    preroll = collections.deque(maxlen=3)  # keeps the start of words from being cut off
    buf = []
    speaking = False
    silence = 0.0
    block_sec = BLOCK_SIZE / SAMPLE_RATE

    print(f"\n[Ready] Listening in language '{lang}' (decoder: '{mode}'). Press Ctrl+C to stop.\n")

    try:
        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=1,
            blocksize=BLOCK_SIZE,
            dtype="float32",
            callback=audio_callback,
        ):
            while True:
                block = audio_queue.get()
                loud = np.sqrt(np.mean(block ** 2)) > threshold

                if loud:
                    if not speaking:
                        buf = list(preroll)
                        speaking = True
                    buf.append(block)
                    silence = 0.0
                elif speaking:
                    buf.append(block)
                    silence += block_sec
                else:
                    preroll.append(block)

                current_dur = len(buf) * block_sec
                too_long = speaking and (current_dur >= max_seconds)

                if speaking and (silence >= silence_end or too_long):
                    if current_dur > MIN_UTTERANCE_SECS:
                        transcribe_utterance(buf)
                    buf = []
                    speaking = False
                    silence = 0.0

    except KeyboardInterrupt:
        print("\n[Stopped] Live transcription ended.")


if __name__ == "__main__":
    args = parse_args()
    run_live_transcription(
        lang=args.lang,
        mode=args.mode,
        threshold=args.threshold,
        silence_end=args.silence_end,
        max_seconds=args.max_seconds,
    )
