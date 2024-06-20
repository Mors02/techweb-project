# Generated by Django 4.2.13 on 2024-06-20 13:46

from django.db import migrations

def create_roles(apps, schema_editor):
    # We can't import the Person model directly as it may be a newer
    # version than this migration expects. We use the historical version.
    Role = apps.get_model("authentication", "Role")
    Role.create(slug="developer", name="Developer")
    Role.create(slug="player", name="Giocatore")


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_roles)
    ]