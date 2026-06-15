# Automated Fundus Image Screening System - Frontend

Vite + React + TailwindCSS frontend for a clinical-style AI fundus screening interface.

## Tech Stack

- Vite
- React (functional components + hooks)
- TailwindCSS
- Fetch API

## Backend Integration

- Endpoint: `POST http://localhost:8000/analyze`
- Body: `multipart/form-data` with field `file`
- Expected response:

```json
{
  "disease": "Glaucoma",
  "confidence": 91.2
}
```

## Run Locally

```bash
npm install
npm run dev
```

Or:

```bash
npm install
npm start
```

Default frontend URL:

- `http://localhost:5173`

## Project Structure

```text
src/
  components/
    Navbar.jsx
    HeroSection.jsx
    UploadCard.jsx
    ResultCard.jsx
  App.jsx
```
