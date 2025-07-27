import os
import django
from django.contrib.auth import get_user_model

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

User = get_user_model()

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@budgetly.com',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    print('Superuser created successfully!')
    print('Username: admin')
    print('Email: admin@budgetly.com') 
    print('Password: admin123')
else:
    print('Superuser already exists!')
