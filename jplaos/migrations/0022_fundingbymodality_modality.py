# Generated by Django 3.2.3 on 2021-08-20 13:34

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('jplaos', '0021_auto_20210820_1320'),
    ]

    operations = [
        migrations.CreateModel(
            name='Modality',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('modality', models.CharField(max_length=120)),
            ],
        ),
        migrations.CreateModel(
            name='FundingByModality',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('allocation', models.IntegerField()),
                ('modality', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='funding',
                                               to='jplaos.modality')),
                ('project',
                 models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='funding_by_modality',
                                   to='jplaos.project')),
            ],
        ),
    ]
