# Generated by Django 4.2.3 on 2023-07-12 04:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('jplaos', '0050_project_outcomes'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sector',
            name='outcomes',
        ),
    ]