# Generated by Django 3.2.3 on 2021-09-04 19:08

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('jplaos', '0038_auto_20210904_1905'),
    ]

    operations = [
        migrations.AddField(
            model_name='partneruser',
            name='partners_access',
            field=models.ManyToManyField(related_name='users_with_access', to='jplaos.Partner'),
        ),
    ]
