import sys
import os

# إضافة مسار المشروع
path = '/home/nehrugamal09/DC-flask'
if path not in sys.path:
    sys.path.insert(0, path)

# إعداد Flask
from server import app as application
