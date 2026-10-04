# 🎙️ Indic ASR · Multilingual Speech to Text

An open-source, high-performance Speech-to-Text (ASR) system for **22+ Indian languages**, powered by AI4Bharat's state-of-the-art [`indic-conformer-600m-multilingual`](https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual) model.

Includes a **modern Web UI** with real-time waveform visualization, dark/light themes, and a **terminal CLI** for direct microphone streaming.

---

## ⚡ Highlights

- **No API Keys Needed**: 100% open-source and free. Runs locally on your machine.
- **Offline Capable**: Once the model weights are downloaded on first run, it functions completely offline.
- **Dual Interface**:
  - **Modern Web UI**: Live audio recording, real-time waveform animations, language switcher, dark/light mode, and one-click clipboard copy.
  - **CLI Live Streaming**: Continuous microphone transcription directly in the terminal with Voice Activity Detection (VAD).
- **22+ Indian Languages**: Hindi, Tamil, Telugu, Bengali, Marathi, Malayalam, Kannada, Gujarati, Punjabi, Odia, Urdu, Assamese, and more.
- **Flexible Decoders**: Supports both **CTC** (fast inference) and **RNN-T** (streaming & high accuracy).

---

## 📂 Project Structure

```text
indic-asr/
├── config.py              # Centralized configuration (model, audio parameters, paths)
├── model.py               # Thread-safe IndicConformer inference engine & warmup
├── server.py              # FastAPI backend serving endpoints and static UI
├── live.py                # Standalone CLI for microphone speech-to-text
├── run.py                 # CLI launcher for the web application
├── requirements.txt       # Python dependencies
├── .gitignore             # Git ignore file for virtualenv, caches, and temp files
├── static/                # Frontend web assets
│   ├── css/
│   │   └── style.css      # Design system, themes, waveforms, responsive layout
│   └── js/
│       └── app.js         # Web Audio API capture, VAD, waveforms, UI logic
└── templates/
    └── index.html         # Web application HTML interface
```

---

## 🛠️ Prerequisites

Before installing the Python packages, ensure system audio drivers (`PortAudio`) and `ffmpeg` are installed on your machine:

### Linux (Ubuntu / Debian)
```bash
sudo apt update
sudo apt install -y portaudio19-dev libasound2-plugins libsndfile1 ffmpeg python3-dev
```

### macOS
```bash
brew install portaudio libsndfile ffmpeg
```

### Windows
- No extra audio packages are usually needed; `sounddevice` includes pre-built PortAudio binaries on Windows.

---

## 🚀 Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/indic-asr.git
cd indic-asr
```

### 2. Create and Activate a Virtual Environment
```bash
# On Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

### 3. Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

> **Note for NVIDIA GPU users (Optional)**:
> If you have a CUDA-enabled GPU and want hardware acceleration, install PyTorch with CUDA support from [pytorch.org](https://pytorch.org):
> ```bash
> pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
> ```

---

## 🌐 Running the Web Application

Start the web server using any of the following commands:

```bash
# Option 1: Using the runner script (Recommended)
python run.py

# Custom host or port
python run.py --host 0.0.0.0 --port 8000

# Option 2: Running server.py directly
python server.py

# Option 3: Using uvicorn
uvicorn server:app --host 0.0.0.0 --port 8000
```

Once running, open your browser and navigate to:
```
http://localhost:8000
```

### Web Interface Features
1. **Language Dropdown**: Select from 22 Indic languages (with native script preview).
2. **Decoder Toggle**: Switch between `CTC` (fast) and `RNN-T` (high accuracy).
3. **Microphone Button**: Click to start speaking. The live visualizer renders your audio waveform.
4. **Auto-Transcription**: When you stop speaking, the system automatically transcribes and displays the text and processing time.
5. **Dark / Light Mode**: Seamless theme switching with persistent aesthetics.
6. **Copy & Clear**: Quick actions to copy transcription to clipboard or clear the workspace.

---

## 💻 Running the Live Microphone CLI

To transcribe speech directly from your terminal microphone in real time:

```bash
# Default: Hindi with RNN-T decoder
python live.py

# Transcribe Tamil
python live.py --lang ta

# Transcribe Telugu
python live.py --lang te

# Transcribe Bengali using CTC decoder
python live.py --lang bn --mode ctc
```

### CLI Command Options

| Argument | Default | Description |
| :--- | :--- | :--- |
| `--lang` | `hi` | Language code (e.g. `hi`, `ta`, `te`, `bn`, `mr`, `ml`, `kn`, `gu`, `pa`) |
| `--mode` | `rnnt` | Decoder architecture: `rnnt` (recommended) or `ctc` |
| `--threshold` | `0.01` | RMS energy threshold for voice detection (raise for noisy rooms) |
| `--silence-end` | `0.8` | Seconds of silence after speech that triggers sentence transcription |
| `--max-seconds` | `25` | Maximum continuous recording duration before forcing transcription |

Press <kbd>Ctrl</kbd> + <kbd>C</kbd> at any time to cleanly stop live recording.

---

## 🗣️ Supported Languages

| Code | English Name | Native Script | Code | English Name | Native Script |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `hi` | Hindi | हिन्दी | `ta` | Tamil | தமிழ் |
| `te` | Telugu | తెలుగు | `bn` | Bengali | বাংলা |
| `mr` | Marathi | मराठी | `gu` | Gujarati | ગુજરાતી |
| `kn` | Kannada | ಕನ್ನಡ | `ml` | Malayalam | മലയാളം |
| `pa` | Punjabi | ਪੰਜਾਬੀ | `or` | Odia | ଓଡ଼ିଆ |
| `as` | Assamese | অসমীয়া | `ur` | Urdu | اردو |
| `ne` | Nepali | नेपाली | `sa` | Sanskrit | संस्कृतम् |
| `sd` | Sindhi | سنڌي | `mai` | Maithili | मैथिली |
| `doi` | Dogri | डोगरी | `kok` | Konkani | कोंकणी |
| `brx` | Bodo | बर'/बड़ो | `sat` | Santali | ᱥᱟᱱᱛᱟᱲᱤ |
| `mni` | Manipuri | মৈতৈলোন্ | `kas` | Kashmiri | کٲشُر |

---

## 🧩 Decoder Modes: CTC vs. RNN-T

| Feature | CTC Decoder (`ctc`) | RNN-T Decoder (`rnnt`) |
| :--- | :--- | :--- |
| **Speed** | ⚡ Extremely fast | ⏱️ Fast |
| **Accuracy** | Good | 🎯 Higher accuracy on complex sentences |
| **Best For** | Lower-spec hardware, quick checks | Conversational speech, production quality |

---

## 🔌 REST API Reference

The FastAPI server provides endpoints you can integrate into other services:

### 1. `POST /transcribe`
Transcribes raw 16 kHz 32-bit floating-point PCM audio data.

- **Query Parameters**:
  - `lang` (optional, default: `hi`): Language code.
  - `mode` (optional, default: `ctc`): Decoder mode (`ctc` or `rnnt`).
- **Body**: Binary raw audio bytes (`np.float32`, 16,000 Hz, mono).
- **Response**:
  ```json
  {
    "text": "नमस्ते आप कैसे हैं",
    "secs": 0.42
  }
  ```

### 2. `GET /health`
Returns service and model status.

- **Response**:
  ```json
  {
    "status": "ok",
    "model_loaded": true,
    "model_name": "ai4bharat/indic-conformer-600m-multilingual"
  }
  ```

---

## ❓ Frequently Asked Questions (FAQ)

### Do I need any API keys or tokens?
**No.** The underlying AI4Bharat model is completely open and public. It downloads directly from Hugging Face on the first run and requires no authentication or API keys.

### How large is the model download?
The model weights are approximately ~1.2 GB. They are downloaded automatically on the first execution and saved to your local cache (`~/.cache/huggingface/hub/`). Subsequent runs load the model instantly from disk with zero network transfer.

### Can I run this without an internet connection?
**Yes.** Once the initial model download has finished, both the web server and the live CLI work 100% offline.

### What if the microphone doesn't trigger?
If background noise is triggering speech detection prematurely, increase the threshold flag:
```bash
python live.py --threshold 0.02
```
If you speak softly or the mic sensitivity is low, lower it:
```bash
python live.py --threshold 0.005
```

---

## 📄 License & Acknowledgements

- Built with [AI4Bharat IndicConformer](https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual).
- Web framework powered by [FastAPI](https://fastapi.tiangolo.com/).
- Audio processing powered by [PyTorch](https://pytorch.org/) and [sounddevice](https://python-sounddevice.readthedocs.io/).
