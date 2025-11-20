import sys
import os

# --- 1) إضافة مسار مشروع Flask ---
project_path = '/home/nehrugamal09/DC-flask'
if project_path not in sys.path:
    sys.path.insert(0, project_path)

# --- 2) التحقق من مكان العمل ---
os.chdir(project_path)

# --- 3) استيراد التطبيق من Flask ---
from server import app as application
