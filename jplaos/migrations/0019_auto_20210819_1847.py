# Generated by Django 3.2.3 on 2021-08-19 18:47

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('jplaos', '0018_auto_20210819_1834'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='partner',
        ),
        migrations.RemoveField(
            model_name='project',
            name='planed_amount',
        ),
    ]