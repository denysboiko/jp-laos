# Generated by Django 3.2.3 on 2021-09-16 18:15

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('jplaos', '0044_alter_pipeline_partner'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='additional_info',
            field=models.TextField(blank=True),
        ),
    ]