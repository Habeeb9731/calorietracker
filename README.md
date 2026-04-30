# CalorieTracker — AI-Powered Meal Logger

A full-stack calorie tracking application with AI-based food detection via camera/image upload.

---

## Project Structure

```
calorie-tracker/
├── backend/          # Node.js + Express + MongoDB REST API
├── frontend/         # React + Vite + Tailwind web app
├── android/          # Kotlin + Jetpack Compose Android app
└── README.md
```

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Backend  | Node.js, Express, MongoDB (Mongoose), JWT, Multer |
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Android  | Kotlin, Jetpack Compose, CameraX, Retrofit |
| AI       | OpenAI GPT-4o Vision API |

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- OpenAI API key (GPT-4o access)
- Android Studio Hedgehog+ (for Android app)
- JDK 17

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

**`.env` variables:**

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g., `7d`) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `FRONTEND_URL` | Web app URL for CORS |

The backend runs at **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The web app runs at **http://localhost:5173**

> The Vite dev server proxies API calls to `localhost:5000` automatically.

---

### 4. Android Setup

1. Open the `android/` folder in **Android Studio**
2. In `app/build.gradle`, update `BASE_URL` to your backend IP:
   ```groovy
   // For emulator: use 10.0.2.2 (maps to localhost)
   buildConfigField "String", "BASE_URL", '"http://10.0.2.2:5000/"'
   
   // For physical device: use your machine's local IP
   buildConfigField "String", "BASE_URL", '"http://192.168.1.X:5000/"'
   ```
3. Sync Gradle and run on emulator or device

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | `{ name, email, password, calorieGoal? }` | Create account |
| POST | `/auth/login` | `{ email, password }` | Login, returns JWT |
| GET | `/auth/me` | — | Get current user (auth required) |
| PATCH | `/auth/update-goal` | `{ calorieGoal }` | Update daily goal |

### Meals

| Method | Endpoint | Query/Body | Description |
|--------|----------|------------|-------------|
| GET | `/meals` | `?date=`, `?startDate=`, `?endDate=` | List meals |
| GET | `/meals/dashboard` | — | Daily + weekly summary |
| POST | `/meals` | `{ title, calories, date, notes?, aiDetected?, aiConfidence? }` | Log meal |
| DELETE | `/meals/:id` | — | Delete meal |

### AI Food Detection

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/analyze-food` | `multipart: image` OR `{ image: base64 }` | Detect food & estimate calories |

**AI Response:**
```json
{
  "foodName": "Chicken Biryani",
  "calories": 520,
  "confidence": 0.88,
  "description": "Aromatic basmati rice with spiced chicken, garnished with fried onions and herbs"
}
```

All protected endpoints require: `Authorization: Bearer <token>`

---

## Features

### Web App
- Email/password authentication with persistent sessions
- Dashboard with daily calorie progress bar and weekly bar chart
- AI food scanner — upload image or take photo → auto-fills meal form
- Edit AI results before saving
- Meal history with date range filter
- Delete meals inline

### Android App
- Full authentication flow (login/register)
- CameraX integration — take photo → AI analyzes → auto-fills form
- Dashboard with custom Canvas bar chart
- Meal history list
- Offline-aware: token persisted in DataStore

### AI Detection
- Uses GPT-4o Vision to identify food and estimate portion-appropriate calories
- Returns confidence score
- Falls back to a mock response if `OPENAI_API_KEY` is not set (for development)

---

## Environment Variables Summary

### Backend (`.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/calorie-tracker
JWT_SECRET=change_this_to_something_long_and_random
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:5173
DEFAULT_CALORIE_GOAL=2000
```

### Frontend (`.env` — optional, Vite proxy handles dev)

```env
VITE_API_URL=http://localhost:5000
```

---

## Development Notes

- Backend uses `multer` with **memory storage** for AI image uploads (images are not persisted to disk)
- The Android emulator uses `10.0.2.2` as the host alias for `localhost`
- `android:usesCleartextTraffic="true"` is set in the manifest for local HTTP; use HTTPS in production
- The OpenAI call uses `detail: "low"` to reduce Vision token costs while maintaining accuracy for food identification

---

## Production Checklist

- [ ] Change `JWT_SECRET` to a cryptographically random value
- [ ] Use MongoDB Atlas or a managed database
- [ ] Set up HTTPS (Let's Encrypt / Cloudflare)
- [ ] Remove `android:usesCleartextTraffic="true"` and use HTTPS backend URL
- [ ] Set `BASE_URL` in Android to your production API domain
- [ ] Enable `minifyEnabled true` in Android release build
- [ ] Add rate limiting to `/analyze-food` endpoint to control OpenAI costs
