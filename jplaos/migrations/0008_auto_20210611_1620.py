# Generated by Django 3.2.3 on 2021-06-11 16:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('jplaos', '0007_auto_20210611_1115'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='nsedpoutcome',
            options={'verbose_name': 'NSEDP Outcome'},
        ),
        migrations.AlterModelOptions(
            name='nsedpoutput',
            options={'verbose_name': 'NSEDP Output'},
        ),
        migrations.AlterModelOptions(
            name='sustainabledevelopmentgoal',
            options={'verbose_name': 'Sustainable Development Goal'},
        ),
    ]
