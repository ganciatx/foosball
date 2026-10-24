# CFBD API Explorer

Local GUI for inspecting [College Football Data](https://api.collegefootballdata.com) responses.

The browser never sees the API key. Vite proxies `GET /cfbd/*` to `https://api.collegefootballdata.com` and attaches `Authorization: Bearer` from `.env`.

## Run

```bash
cp .env.example .env   # then paste CFBD_API_KEY
npm install
npm run dev
```

Open http://localhost:5173

- Filter endpoints in the left rail
- Edit query params, or use **Load sample**
- **Send** or Cmd/Ctrl+Enter
- Inspect the tree, expand records, or copy raw JSON

Start with `/info` to confirm the key and remaining quota, then `/ratings/core?year=2026` or `/games?year=2026&week=4&classification=fbs`.
