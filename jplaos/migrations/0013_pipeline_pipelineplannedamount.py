# Generated by Django 3.2.3 on 2021-08-10 10:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('jplaos', '0012_auto_20210702_1631'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pipeline',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('partner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pipelines', to='jplaos.partner')),
                ('sector', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pipelines', to='jplaos.sector')),
            ],
            options={
                'db_table': 'pipeline',
            },
        ),
        migrations.CreateModel(
            name='PipelinePlannedAmount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.PositiveIntegerField()),
                ('planed_amount', models.FloatField()),
                ('pipeline', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='planned_amount', to='jplaos.pipeline')),
            ],
        ),
    ]
