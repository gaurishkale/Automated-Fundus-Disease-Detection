# 👁️ Automated-Fundus-Disease-Detection
### AI-Powered Retinal Disease Screening & Intelligent Ophthalmology Assistant

EyeDetect AI is an end-to-end healthcare platform that combines **Deep Learning-based Fundus Disease Detection**, a **Multilingual AI Medical Chatbot**, **Voice Assistant**, **Patient Management**, and **Clinical Analytics** to support early screening and awareness of retinal diseases.

The system analyzes retinal fundus images, predicts possible eye diseases, generates detailed reports, provides preventive guidance, and offers an AI-powered ophthalmology assistant for patient education.

---

## 🚀 Features

### 🔍 AI Fundus Disease Detection
- Upload retinal/fundus images
- Automated disease prediction
- Confidence score generation
- Risk-level assessment
- Fast AI-powered screening

### 🤖 AI Ophthalmology Chatbot
- Intelligent eye-health assistant
- Disease awareness and education
- Symptom-based guidance
- Context-aware RAG knowledge retrieval
- Instant response generation

### 🌐 Multilingual Support
- English
- Hindi
- Marathi

### 🎤 Voice Assistant
- Speech-to-Text using Faster-Whisper
- Text-to-Speech using Edge-TTS
- Voice-enabled interaction with chatbot

### 👨‍⚕️ Patient Management
- Patient information storage
- Session-based consultation flow
- Personalized AI interactions

### 📊 Analytics Dashboard
- Screening statistics
- Disease distribution
- Risk analysis
- Monthly screening trends
- Clinical insights visualization

### 📁 Scan History
- Store previous screenings
- Review past reports
- Download generated reports
- Track disease progression

### 🏥 Doctor Finder
- Locate nearby healthcare professionals
- Connect patients with specialists

### 🛡 Preventive Healthcare
- Eye care recommendations
- Disease prevention guidance
- Lifestyle improvement suggestions

---

## 🏗️ System Architecture

```text
Patient
   │
   ▼
React Frontend
   │
   ▼
FastAPI Backend
   │
   ├── Disease Detection Model
   │       │
   │       ▼
   │   Prediction Result
   │
   ├── AI Chatbot
   │       │
   │       ├── RAG Knowledge Base
   │       ├── Language Detection
   │       └── Ollama Phi-3 Mini
   │
   ├── Speech-to-Text
   │       ▼
   │   Faster Whisper
   │
   └── Text-to-Speech
           ▼
       Edge TTS
```

---

## 🧠 Supported Eye Conditions

- Diabetic Retinopathy
- Glaucoma
- Cataract
- Age-related Macular Degeneration (AMD)
- Retinal Detachment
- Dry Eye Syndrome
- Hypertensive Retinopathy
- Myopia

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Recharts
- Axios

### Backend
- Python
- FastAPI
- Pydantic

### AI & Machine Learning
- Deep Learning
- Computer Vision
- Fundus Image Classification
- Retrieval-Augmented Generation (RAG)

### LLM
- Ollama
- Phi-3 Mini

### Voice AI
- Faster-Whisper
- Edge-TTS

### Data Processing
- NumPy
- Pandas
- OpenCV

---

## 📂 Project Structure

```text
EyeDetect-AI/
│
├── frontend/
│   ├── Home.jsx
│   ├── Analyze.jsx
│   ├── History.jsx
│   ├── Progress.jsx
│   ├── App.jsx
│   └── Components/
│
├── chatbot/
│   ├── chatbot_api.py
│   ├── knowledge_base.py
│   ├── language_detection.py
│   ├── llm_service.py
│   └── speech_service.py
│
├── model/
│   ├── disease_detection_model
│   └── prediction_pipeline
│
├── reports/
│
├── assets/
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/gaurishkale/Automated-Fundus-Disease-Detection.git

cd Automated-Fundus-Disease-Detection
```

---

## 🔧 Backend Setup

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI server:

```bash
uvicorn main:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

---

## 🌐 Frontend Setup

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 🤖 Ollama Setup

Install Ollama:

```bash
ollama pull phi3:mini
```

Run model:

```bash
ollama run phi3:mini
```

Verify:

```bash
ollama list
```

---

## 🎤 Voice Features Setup

Install Faster Whisper:

```bash
pip install faster-whisper
```

Install Edge TTS:

```bash
pip install edge-tts
```

---

## 📊 Workflow

1. Patient enters information
2. Fundus image is uploaded
3. AI model analyzes image
4. Disease prediction is generated
5. Confidence score is calculated
6. Report is created
7. Results are stored in history
8. Patient can interact with AI chatbot
9. Voice assistant enables hands-free interaction
10. Analytics dashboard tracks screening trends

---

## 📈 Future Enhancements

- Explainable AI (Grad-CAM)
- Cloud Deployment
- Mobile Application
- Electronic Health Record Integration
- Multi-Disease Classification Expansion
- Real-Time Clinical Monitoring
- Multi-Language Expansion

---

## 🎯 Applications

- Eye Disease Screening
- Telemedicine
- Clinical Decision Support
- Rural Healthcare Assistance
- Ophthalmology Clinics
- Healthcare Research

---

## 👨‍💻 Author

**Gaurish Kale**

Artificial Intelligence & Machine Learning Engineer

GitHub: https://github.com/gaurishkale

---

## ⭐ Support

If you found this project useful, consider giving it a **Star ⭐** on GitHub.

---

### Disclaimer

This system is intended for educational and screening purposes only. It does not replace professional medical diagnosis, treatment, or consultation by a qualified ophthalmologist.
````



---

# 📸 Application Screenshots

## 🏠 Landing Page

![Landing Page](eye%201(2).jpeg)

## 🔬 AI Disease Detection Workflow

### Upload & Analyze
![Upload Analyze](1000553636(2).jpg)

### AI Scanning Process
![AI Scanning](1000553638(2).jpg)

### Prediction Results
![Prediction Results](1000553642(2).jpg)

## 📚 RAG Knowledge Base

![Knowledge Base](1000553648(2).jpg)

## 🤖 Multilingual RAG Medical Assistant

### Chat Interface
![Chat Interface](1000553646(2).jpg)

### Context-Aware Medical Response
![Medical Response](1000553644(2).jpg)

## ✨ Key Highlights

- AI-powered retinal disease screening
- Deep learning-based fundus image analysis
- Retrieval-Augmented Generation (RAG) medical assistant
- Multilingual support (English, Hindi, Marathi)
- Voice-enabled chatbot interaction
- Knowledge-base grounded responses
- Patient screening history and analytics
