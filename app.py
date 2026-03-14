from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import requests as http
from chat import get_response
from groq_handler import is_groq_configured
import re
import json
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)
CORS(app)

with open(os.path.join(BASE_DIR, 'intents.json'), 'r') as file:
    responses = json.load(file)

app.secret_key = os.environ.get('SECRET_KEY', 'change-me-in-production')

# Supabase REST API config
SUPABASE_URL = os.environ.get('SUPABASE_URL')          # e.g. https://xxxx.supabase.co
SUPABASE_KEY = os.environ.get('SUPABASE_PUBLISHABLE_KEY')  # sb_publishable_...

def supa_headers():
    return {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }

def supa_get_user(email, password):
    """Fetch a user by email + password."""
    res = http.get(
        f'{SUPABASE_URL}/rest/v1/user',
        headers={**supa_headers(), 'Accept': 'application/json'},
        params={'email': f'eq.{email}', 'password': f'eq.{password}', 'limit': 1}
    )
    data = res.json()
    return data[0] if data else None

def supa_get_by_email(email):
    """Check if an email already exists."""
    res = http.get(
        f'{SUPABASE_URL}/rest/v1/user',
        headers={**supa_headers(), 'Accept': 'application/json'},
        params={'email': f'eq.{email}', 'limit': 1}
    )
    data = res.json()
    return data[0] if data else None

def supa_create_user(name, email, password):
    """Insert a new user row."""
    res = http.post(
        f'{SUPABASE_URL}/rest/v1/user',
        headers={**supa_headers(), 'Prefer': 'return=minimal'},
        json={'name': name, 'email': email, 'password': password}
    )
    return res.status_code in (200, 201)


# ── ROUTES ──────────────────────────────────────────

@app.route('/')
@app.route('/login', methods=['GET', 'POST'])
def login():
    message = ''

    if 'flash' in session:
        message = session.pop('flash')

    if request.method == 'POST':
        email    = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()

        if not (email and password):
            message = 'Please fill in all fields.'
        else:
            try:
                user = supa_get_user(email, password)
                if user:
                    session['loggedin'] = True
                    session['name']     = user['name']
                    session['email']    = user['email']
                    return render_template('index.html', message='')
                else:
                    message = 'Incorrect email or password.'
            except Exception as e:
                message = f'Error: {e}'

    return render_template('login.html', message=message)


@app.route('/register', methods=['GET', 'POST'])
def register():
    message = ''

    if request.method == 'POST':
        name     = request.form.get('name', '').strip()
        email    = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()

        if not (name and email and password):
            message = 'Please fill out all fields.'
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            message = 'Invalid email address.'
        else:
            try:
                if supa_get_by_email(email):
                    message = 'An account with that email already exists.'
                elif supa_create_user(name, email, password):
                    session['flash'] = 'Account created! You can now log in.'
                    return redirect(url_for('login'))
                else:
                    message = 'Failed to create account. Please try again.'
            except Exception as e:
                message = f'Error: {e}'

    return render_template('register.html', message=message)


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.post('/predict')
def predict():
    data     = request.get_json() or {}
    text     = data.get('message', '')
    history  = data.get('history', None)
    response = get_response(text, use_groq=True, conversation_history=history)
    return jsonify({'answer': response})


@app.get('/status')
def status():
    return jsonify({
        'groq_enabled': is_groq_configured(),
        'groq_model':   os.environ.get('GROQ_MODEL', 'llama3-8b-8192')
    })


if __name__ == '__main__':
    app.run(debug=True)
