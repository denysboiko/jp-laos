# Generated by Django 3.2.3 on 2021-08-20 13:20

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('jplaos', '0020_project_is_regional'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='implementingpartner',
            name='category',
        ),
        migrations.AddField(
            model_name='implementingpartner',
            name='category',
            field=models.ManyToManyField(to='jplaos.ImplementingPartnerCategory'),
        ),
    ]
