# Generated by Django 4.2.3 on 2023-12-06 01:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('jplaos', '0056_partnerfunding_funding_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='funding_type',
        ),
    ]