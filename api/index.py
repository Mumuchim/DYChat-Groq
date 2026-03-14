import sys
import os

# Add the parent directory to the path so we can import from the root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Flask app from the root app.py
from app import app

# Vercel expects a callable named `app`
# Flask's app object is already a WSGI callable — no extra work needed
