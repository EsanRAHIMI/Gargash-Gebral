# Gebral | Agentic AI Automotive Platform

A futuristic, modular, and intelligent multi-service platform designed to revolutionize the relationship between vehicles, drivers, and service providers.

---

## 🚗 About Gebral

**Gebral** is an advanced Agentic AI system for smart automotive ecosystems. It monitors real-time car diagnostics, driver behavior, and city context using camera vision, voice interaction, and vehicle sensors. Gebral acts as a proactive co-pilot, safety advisor, and service connector.

It is designed for:

* End-users (drivers, car owners, parents)
* Car leasing and rental companies
* Automotive service providers (like Gargash Group)
* Insurance providers

---

## 📦 Monorepo Project Structure

```
Gebral/
├── ai/          # AI agent powered by FastAPI & OpenAI
├── api/         # Auth & User Management microservice using Express + MongoDB
├── frontend/    # React + Vite frontend UI
```
FRONTEND_URL=http://localhost:3000
VITE_BACKEND_URL=http://localhost:5002/api
VITE_CHAT_URL=http://localhost:5003/ai
VITE_AUTH_URL=http://localhost:5002/api/auth
---

## 🔧 Current Status (MVP)

* ✅ FastAPI-based AI agent with voice-like API (port 5003)
* ✅ Express API with JWT Auth and MongoDB (port 5002)
* ✅ Vite-powered React frontend (port 3000)
* ✅ AI ↔ API ↔ Frontend fully connected
* ✅ Secure cookie-based auth, protected routes, and multi-role support

---

## 🧠 AI Agent (`/ai`)

**Stack:** Python, FastAPI, Pydantic, Uvicorn, httpx, JWT, OpenAI SDK

### Features

* `/ai/chat`: Main endpoint for user-agent interaction
* OpenAI-backed response generator
* Voice-like, context-aware reply system
* ReDoc/Swagger auto-generated docs

To run:

```bash
cd ai
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 5003
```

---

## 🔐 API Service (`/api`)

**Stack:** TypeScript, Express, MongoDB, JWT, ts-node-dev

### Features

* `/api/auth`: Register, login, logout, token verification
* `/api/user`: User profile access
* `/api/code`: Secure dev code browser (with password)

To run:

```bash
cd api
yarn run start:dev
```

---

## 💻 Frontend App (`/frontend`)

**Stack:** React, Vite, TypeScript, TailwindCSS, React Router, React Query

### Features 

* Home, Login, Register pages
* Protected Dashboard and Chat views
* AI chat UI component with async streaming

To run:

```bash
cd frontend
yarn dev
```

---

## 🧱 Architecture Highlights

* Modular: Each service is independently deployable
* API Gateway-ready
* Future-ready for Docker, CI/CD, WebSocket, and real-time voice
* Authentication using HttpOnly cookies
* Frontend state managed with React Query

---

## 📈 Future Enhancements

* AI agent with emotion and risk scoring
* Car dashboard integration via CAN bus
* Fleet & insurance analytics panel
* Self-healing diagnostics suggestions
* Real-time emergency dispatch integration

---

## 🤖 Vision

> “Gebral transforms every vehicle into a thinking, caring, proactive partner on the road.”

---

## 🧪 Local Environment Setup

Make sure to create `.env` files in each directory (`ai`, `api`, `frontend`) based on the sample files provided.

Ensure MongoDB is running, and required Python and Node packages are installed.

---

## 📄 License

MIT © 2025 — Gebral Team / ALNAJAH ALMUDAMUN TRADING CO. L.L.C.
