# Generated by Django 3.2.3 on 2021-08-19 18:34

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('jplaos', '0017_implementingpartner_category'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='other_subsector',
        ),
        migrations.AlterField(
            model_name='greensubcategoryfundingallocation',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE,
                                    related_name='green_categories', to='jplaos.project'),
        ),
        migrations.AlterField(
            model_name='partnerfunding',
            name='partner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partners',
                                    to='jplaos.partner'),
        ),
        migrations.AlterField(
            model_name='partnerfunding',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partners',
                                    to='jplaos.project'),
        ),
    ]
