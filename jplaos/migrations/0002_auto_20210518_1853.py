# Generated by Django 3.2.3 on 2021-05-18 18:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('jplaos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SDG',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='PriorityArea',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('priority_area', models.CharField(max_length=120)),
                ('sector', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sector', to='jplaos.sector')),
            ],
            options={
                'db_table': 'priority_areas',
            },
        ),
        migrations.AddField(
            model_name='sector',
            name='sdg',
            field=models.ManyToManyField(related_name='sustainable_development_goals', to='jplaos.SDG'),
        ),
    ]
