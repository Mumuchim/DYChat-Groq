from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from chat import get_response
from groq_handler import is_groq_configured
import re
import json
import os

# Load .env for local development
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


def get_db():
    """Open a Supabase/Postgres connection using the DATABASE_URL connection string."""
    return psycopg2.connect(os.environ.get('DATABASE_URL'), sslmode='require')


# ── ROUTES ──────────────────────────────────────────

@app.route('/')
@app.route('/login', methods=['GET', 'POST'])
def login():
    message = ''

    # Show success flash from registration redirect
    if 'flash' in session:
        message = session.pop('flash')

    if request.method == 'POST':
        email    = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()

        if email and password:
            try:
                conn = get_db()
                cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                cur.execute(
                    'SELECT * FROM "user" WHERE email = %s AND password = %s',
                    (email, password)
                )
                user = cur.fetchone()
                cur.close()
                conn.close()

                if user:
                    session['loggedin'] = True
                    session['name']     = user['name']
                    session['email']    = user['email']
                    return render_template('index.html', message='')
                else:
                    message = 'Incorrect email or password.'
            except Exception as e:
                message = f'Database error: {e}'
        else:
            message = 'Please fill in all fields.'

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
                conn = get_db()
                cur  = conn.cursor()
                cur.execute('SELECT id FROM "user" WHERE email = %s', (email,))
                if cur.fetchone():
                    message = 'An account with that email already exists.'
                else:
                    cur.execute(
                        'INSERT INTO "user" (name, email, password) VALUES (%s, %s, %s)',
                        (name, email, password)
                    )
                    conn.commit()
                    cur.close()
                    conn.close()
                    session['flash'] = 'Account created! You can now log in.'
                    return redirect(url_for('login'))

                cur.close()
                conn.close()
            except Exception as e:
                message = f'Database error: {e}'

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
        'local_model':  True,
        'groq_enabled': is_groq_configured(),
        'groq_model':   os.environ.get('GROQ_MODEL', 'llama3-8b-8192')
    })


if __name__ == '__main__':
    app.run(debug=True)
