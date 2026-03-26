# NutriThrive Research

NutriThrive Research is a full-stack AI recipe assistant built for cancer-support nutrition use cases. It combines a React chat interface with a FastAPI retrieval and generation backend that searches recipes, applies nutrition-aware filtering, and returns guided recipe suggestions with adaptations and generated instructions when needed.

## What This Project Does

- Chat-style recipe discovery with conversation history
- Retrieval-augmented backend using recipe data from `Recipe.csv`
- Constraint-aware search for symptoms, ingredients, equipment, and meal preferences
- AICR-oriented recipe verification and compliance details
- Generated tips, adaptations, and recipe instructions when the backend needs to enrich a result

## Tech Stack

### Frontend

- React 19
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- FastAPI
- Python 3.11 recommended
- LangChain
- FAISS
- OpenAI API
- Pandas

## Project Structure

```text
nutrithrive-research/
├── src/                         # React frontend
├── public/                      # Static frontend assets
├── recipe_rag_backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint
│   │   ├── core/                # Backend config
│   │   ├── models/              # Pydantic schemas
│   │   ├── services/            # RAG, search, verification, enhancement logic
│   │   └── data/Recipe.csv      # Recipe dataset
│   ├── requirements.txt
│   └── .env.example
├── .env.example
├── package.json
└── README.md
```

## How It Works

1. The React app sends user chat prompts to the FastAPI backend.
2. The backend analyzes intent and constraints from the latest message and prior conversation.
3. Matching recipes are retrieved and reranked.
4. Recipes are verified and enhanced with helpful tips, adaptations, and instructions where needed.
5. The frontend renders the assistant reply and expandable recipe cards in a chat interface.

## Prerequisites

- Node.js 18+ recommended
- npm
- Python 3.11 recommended
- An OpenAI API key

## Environment Variables

### Frontend

Create a root `.env` from `.env.example` if you want to override the backend URL:

```bash
cp .env.example .env
```

Available variable:

- `REACT_APP_BACKEND_URL`: backend base URL for the React app

Default behavior without the variable:

- The frontend falls back to `http://<current-host>:8000`

### Backend

Create a backend `.env` file from the example:

```bash
cp recipe_rag_backend/.env.example recipe_rag_backend/.env
```

Required variables:

- `OPENAI_API_KEY`

Optional variables:

- `DATA_FILE_PATH`

## Local Development

### 1. Start the Backend

```bash
cd recipe_rag_backend
/opt/homebrew/bin/python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend health check:

```bash
curl http://localhost:8000/health
```

### 2. Start the Frontend

From the project root:

```bash
npm install
npm start
```

Or explicitly point the frontend to the backend:

```bash
REACT_APP_BACKEND_URL=http://localhost:8000 npm start
```

Frontend URL:

- `http://localhost:3000`

## API Endpoints

### `GET /health`

Returns backend health and initialization status.

### `POST /ask`

Main conversational endpoint for recipe retrieval and adaptation.

Example payload:

```json
{
  "query": "I feel nauseous and only have a microwave",
  "mode": "auto",
  "conversation_history": [
    {
      "role": "user",
      "content": "Show me easy lunch recipes"
    }
  ]
}
```

### `GET /system/info`

Returns backend capability and initialization metadata.

## GitHub Readiness Notes

- Real secrets are ignored through `.gitignore`
- Safe starter environment files are included as `.env.example`
- Python virtual environments, build outputs, logs, and local caches are ignored
- `tiktoken` has been added to backend requirements because the OpenAI embedding flow depends on it

## Before You Push

1. Make sure `recipe_rag_backend/.env` is not committed.
2. Make sure your OpenAI API key is not present anywhere in tracked files.
3. If you pasted a real API key anywhere publicly during setup, rotate it before pushing.

## Useful Commands

### Frontend

```bash
npm start
npm run build
npx tsc --noEmit
```

### Backend

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
python -m py_compile app/main.py
```

## Current Status

- Frontend and backend service connection fixed
- Backend health reporting improved
- Chat UI upgraded with separate pane scrolling
- Recipe cards preserve expandable functionality for generated content

## License

Add your preferred license before publishing publicly.
