# DADDY IS DON

**Your AI. Your Conversation. Your World.**

**Live demo:** https://daddy-is-don.vercel.app

*The backend runs on a free plan. If it was asleep, the first load can take up to a minute.*

DADDY IS DON is a ChatGPT-style AI chatbot. It has a dark and light interface, user accounts, and saved chat history. The AI part is a real AI model. There are no fake answers.

This is a portfolio project built with Python (FastAPI) and React.

## Screenshots

Add your screenshots to the `docs/screenshots/` folder and link them here.

| Login page | Chat | Settings |
| --- | --- | --- |
| ![Login](docs/screenshots/login.png) | ![Chat](docs/screenshots/chat.png) | ![Settings](docs/screenshots/settings.png) |

## Features

- Real AI answers from Google Gemini or Anthropic Claude. You choose in the `.env` file.
- Chat history saved in a database. It stays after you refresh the page.
- Rename, delete, search and clear chats.
- Chat memory. Earlier messages are sent to the AI for context.
- Regenerate the last answer.
- Markdown formatting, code blocks and a Copy code button.
- Copy any AI answer.
- Typing indicator, Enter to send, Shift + Enter for a new line.
- Register, login and logout with secure password hashing (bcrypt) and JWT tokens.
- Every user sees only their own chats.
- Settings page with dark mode, light mode, profile, clear all history and logout.
- Works on desktop and mobile screens.
- Clear error messages for a wrong key, a missing key, no internet and a slow AI.

## Tech stack

| Part | Technology |
| --- | --- |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite (local development) |
| Authentication | JWT (PyJWT), bcrypt |
| AI | Google Gemini API and Anthropic Claude API (REST calls with httpx) |
| Frontend | React, TypeScript, Vite, react-markdown |

## Project structure

```
daddy-is-don/
  backend/
    app/
      main.py            starts the app
      config.py          reads settings from .env
      database.py        database connection
      models.py          database tables
      schemas.py         data shapes and validation
      security.py        password hashing and login tokens
      routers/
        auth.py          register, login, logout
        chat.py          chats and messages
      services/
        ai_service.py    talks to the AI (Gemini or Claude)
    requirements.txt
    .env.example
  frontend/
    src/
      components/        sidebar, chat window, input box, markdown
      pages/             login page, chat page, settings page
      services/api.ts    calls to the backend
    package.json
    .env.example
  README.md
  .gitignore
```

## Getting started (Windows PowerShell)

You need Python 3.12 or newer, Node.js 18 or newer, and Git.

### 1. Download the project

```powershell
git clone https://github.com/YOUR-USERNAME/daddy-is-don.git
cd daddy-is-don
```

### 2. Start the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `.env` and add your API key (see "API configuration" below). Then start the server:

```powershell
python -m uvicorn app.main:app --port 8000
```

Check it at http://127.0.0.1:8000/api/health. You should see `"status": "ok"`.

If PowerShell does not let you run the activate script, run this once:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### 3. Start the frontend

Open a second PowerShell window:

```powershell
cd daddy-is-don\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173 in your browser. Create an account and start chatting.

## API configuration

All secrets live in `backend/.env`. This file is never uploaded to GitHub.

| Setting | What it does |
| --- | --- |
| `AI_PROVIDER` | `gemini` or `anthropic` |
| `GEMINI_API_KEY` | Free key from https://aistudio.google.com |
| `GEMINI_MODEL` | Gemini model name, for example `gemini-flash-lite-latest` |
| `ANTHROPIC_API_KEY` | Key from https://console.anthropic.com (needs paid credit) |
| `ANTHROPIC_MODEL` | Claude model name |
| `SECRET_KEY` | Long random text that signs login tokens |
| `DATABASE_URL` | Database address. Default is a local SQLite file |
| `FRONTEND_URL` | Website address allowed by CORS. Default is `http://localhost:5173` |

Make a strong `SECRET_KEY` with this command:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

The frontend setting `VITE_API_URL` in `frontend/.env` is the address of the backend.

## API endpoints

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the logged-in user |
| GET | `/api/conversations` | List chats (use `?q=word` to search) |
| POST | `/api/conversations` | Create a chat |
| PATCH | `/api/conversations/{id}` | Rename a chat |
| DELETE | `/api/conversations/{id}` | Delete a chat |
| DELETE | `/api/conversations` | Delete all chats of the user |
| GET | `/api/conversations/{id}/messages` | Get messages of a chat |
| DELETE | `/api/conversations/{id}/messages` | Clear messages of a chat |
| POST | `/api/conversations/{id}/regenerate` | Redo
@'
# DADDY IS DON

**Your AI. Your Conversation. Your World.**

**Live demo:** https://daddy-is-don.vercel.app

*The backend runs on a free plan. If it was asleep, the first load can take up to a minute.*

DADDY IS DON is a ChatGPT-style AI chatbot. It has a dark and light interface, user accounts, and saved chat history. The AI part is a real AI model. There are no fake answers.

This is a portfolio project built with Python (FastAPI) and React.

## Screenshots

Add your screenshots to the `docs/screenshots/` folder and link them here.

| Login page | Chat | Settings |
| --- | --- | --- |
| ![Login](docs/screenshots/login.png) | ![Chat](docs/screenshots/chat.png) | ![Settings](docs/screenshots/settings.png) |

## Features

- Real AI answers from Google Gemini or Anthropic Claude. You choose in the `.env` file.
- Chat history saved in a database. It stays after you refresh the page.
- Rename, delete, search and clear chats.
- Chat memory. Earlier messages are sent to the AI for context.
- Regenerate the last answer.
- Markdown formatting, code blocks and a Copy code button.
- Copy any AI answer.
- Typing indicator, Enter to send, Shift + Enter for a new line.
- Register, login and logout with secure password hashing (bcrypt) and JWT tokens.
- Every user sees only their own chats.
- Settings page with dark mode, light mode, profile, clear all history and logout.
- Works on desktop and mobile screens.
- Clear error messages for a wrong key, a missing key, no internet and a slow AI.

## Tech stack

| Part | Technology |
| --- | --- |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite (local development) |
| Authentication | JWT (PyJWT), bcrypt |
| AI | Google Gemini API and Anthropic Claude API (REST calls with httpx) |
| Frontend | React, TypeScript, Vite, react-markdown |

## Project structure

```
daddy-is-don/
  backend/
    app/
      main.py            starts the app
      config.py          reads settings from .env
      database.py        database connection
      models.py          database tables
      schemas.py         data shapes and validation
      security.py        password hashing and login tokens
      routers/
        auth.py          register, login, logout
        chat.py          chats and messages
      services/
        ai_service.py    talks to the AI (Gemini or Claude)
    requirements.txt
    .env.example
  frontend/
    src/
      components/        sidebar, chat window, input box, markdown
      pages/             login page, chat page, settings page
      services/api.ts    calls to the backend
    package.json
    .env.example
  README.md
  .gitignore
```

## Getting started (Windows PowerShell)

You need Python 3.12 or newer, Node.js 18 or newer, and Git.

### 1. Download the project

```powershell
git clone https://github.com/YOUR-USERNAME/daddy-is-don.git
cd daddy-is-don
```

### 2. Start the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `.env` and add your API key (see "API configuration" below). Then start the server:

```powershell
python -m uvicorn app.main:app --port 8000
```

Check it at http://127.0.0.1:8000/api/health. You should see `"status": "ok"`.

If PowerShell does not let you run the activate script, run this once:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### 3. Start the frontend

Open a second PowerShell window:

```powershell
cd daddy-is-don\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173 in your browser. Create an account and start chatting.

## API configuration

All secrets live in `backend/.env`. This file is never uploaded to GitHub.

| Setting | What it does |
| --- | --- |
| `AI_PROVIDER` | `gemini` or `anthropic` |
| `GEMINI_API_KEY` | Free key from https://aistudio.google.com |
| `GEMINI_MODEL` | Gemini model name, for example `gemini-flash-lite-latest` |
| `ANTHROPIC_API_KEY` | Key from https://console.anthropic.com (needs paid credit) |
| `ANTHROPIC_MODEL` | Claude model name |
| `SECRET_KEY` | Long random text that signs login tokens |
| `DATABASE_URL` | Database address. Default is a local SQLite file |
| `FRONTEND_URL` | Website address allowed by CORS. Default is `http://localhost:5173` |

Make a strong `SECRET_KEY` with this command:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

The frontend setting `VITE_API_URL` in `frontend/.env` is the address of the backend.

## API endpoints

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the logged-in user |
| GET | `/api/conversations` | List chats (use `?q=word` to search) |
| POST | `/api/conversations` | Create a chat |
| PATCH | `/api/conversations/{id}` | Rename a chat |
| DELETE | `/api/conversations/{id}` | Delete a chat |
| DELETE | `/api/conversations` | Delete all chats of the user |
| GET | `/api/conversations/{id}/messages` | Get messages of a chat |
| DELETE | `/api/conversations/{id}/messages` | Clear messages of a chat |
| POST | `/api/conversations/{id}/regenerate` | Redo the last AI answer |
| POST | `/api/chat` | Send a message and get the AI answer |

When the backend is running, you can try all endpoints at http://127.0.0.1:8000/docs

## Tests

Run these from the `backend` folder with the virtual environment on:

```powershell
python test_auth.py     # register, login, and that users cannot see each other's chats
python test_errors.py   # wrong key, missing key, no internet, slow AI
python test_ai.py       # one real call to the AI
```

## Known limitations

- Answers appear all at once. There is no word-by-word streaming and no stop button yet.
- Code blocks have no syntax colors yet.
- There is no password reset.
- The login token is stored in the browser (localStorage).
- The free Gemini plan has rate limits.
- The Claude provider code is written, but it has not been tested with a live Anthropic key.
- Local SQLite data is not suitable for production hosting. Use a managed database when deploying.

## Future ideas

- Streaming answers and a stop button
- Syntax highlighting in code blocks
- Password reset by email
- More AI providers

## Deployment

Deployment instructions will be added here.

## Author

Built by Umang Singh.

