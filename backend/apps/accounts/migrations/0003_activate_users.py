from django.db import migrations
from django.contrib.auth import get_user_model

def activate_all_users(apps, schema_editor):
    User = get_user_model()
    # Active tous les utilisateurs inactifs
    User.objects.filter(is_active=False).update(is_active=True)
    print("Tous les utilisateurs inactifs ont été activés")

class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0002_create_superuser'),  # Remplace par ta dernière migration
    ]

    operations = [
        migrations.RunPython(activate_all_users),
    ]
