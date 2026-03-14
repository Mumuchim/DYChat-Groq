# Deploying DYChat — Supabase + Vercel

## Overview
- **Database**: Supabase (free PostgreSQL)
- **Backend**: Vercel (serverless Python/Flask)
- **AI**: Groq API (llama3 fallback)

---

## Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `dychat`), set a strong DB password, pick a region near you
3. Wait ~2 minutes for provisioning

### Create the users table

In your Supabase project → **SQL Editor** → paste and run:

```sql
-- Create the user table
CREATE TABLE IF NOT EXISTS "user" (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  email    VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Allow the REST API to read/write it (required for publishable key access)
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON "user"
  FOR ALL USING (true) WITH CHECK (true);
```

### Get your connection string

Go to **Project Settings → Database → Connection string → URI** and copy the full URL. It looks like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

Just replace `[YOUR-PASSWORD]` with your actual DB password.

---

## Step 2 — Configure your .env (local dev)

Copy `.env.example` to `.env` and fill in your values:

```env
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-db-password

GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama3-8b-8192

SECRET_KEY=any-long-random-string
```

Test locally:
```bash
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

---

## Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "DYChat with Supabase + Groq"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dychat.git
git push -u origin main
```

> `.env` is already in `.gitignore` — your secrets stay local.

---

## Step 4 — Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → select your repo
2. Vercel auto-detects Python. No build settings needed.
3. Open **Environment Variables** and add all 6 keys:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Connect panel → Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Connect panel → Publishable Key |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | `llama3-8b-8192` |
| `SECRET_KEY` | Any random string |

4. Click **Deploy** — you'll get a live URL like `dychat.vercel.app`

---

## ⚠️ PyTorch size issue on Vercel

`torch` is ~800MB — Vercel's limit is 250MB. The simplest fix:

In `chat.py`, change one line so Groq handles all responses:
```python
CONFIDENCE_THRESHOLD = 1.1   # was 0.75 — local model never triggers
```

Then slim down `requirements.txt` — remove `torch` and `nltk`:
```
flask==3.0.3
flask-cors==4.0.1
psycopg2-binary==2.9.9
requests==2.32.3
python-dotenv==1.0.1
```

And comment out the model loading block in `chat.py` (or wrap it in a try/except).
Since Groq is already your smarter fallback, this is the recommended approach for Vercel.

---

## Project structure

```
dychat/
├── api/
│   └── index.py          ← Vercel serverless entry point
├── templates/            ← HTML (login, register, chat)
├── static/               ← CSS, JS, images
├── app.py                ← Flask app (Supabase/psycopg2)
├── chat.py               ← Local model + Groq fallback
├── groq_handler.py       ← Groq API
├── model.py / nltk_utils.py / train.py
├── data.pth / intents.json
├── vercel.json
├── requirements.txt
├── .env                  ← Local secrets (never commit)
└── .env.example          ← Safe template
```
