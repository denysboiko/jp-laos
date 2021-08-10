# Generated by Django 3.2.3 on 2021-08-10 10:47

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('jplaos', '0013_pipeline_pipelineplannedamount'),
    ]

    operations = [
        migrations.RenameField(
            model_name='pipelineplannedamount',
            old_name='planed_amount',
            new_name='planed_amount_2021',
        ),
        migrations.RemoveField(
            model_name='pipelineplannedamount',
            name='year',
        ),
        migrations.AddField(
            model_name='pipelineplannedamount',
            name='planed_amount_2022',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pipelineplannedamount',
            name='planed_amount_2023',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pipelineplannedamount',
            name='planed_amount_2024',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pipelineplannedamount',
            name='planed_amount_2025',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pipelineplannedamount',
            name='planed_amount_2026',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pipelineplannedamount',
            name='planed_amount_2027',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pipelineplannedamount',
            name='sector',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='jplaos.sector'),
        ),
    ]