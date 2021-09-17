# Generated by Django 3.2.3 on 2021-09-04 19:05

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('jplaos', '0037_fundingbygreencategory'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='partner',
            name='users_access',
        ),
        migrations.CreateModel(
            name='PartnerUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('primary_partner',
                 models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='primary_users',
                                   to='jplaos.partner')),
                (
                'user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Partner User',
                'verbose_name_plural': 'Partner Users',
                'db_table': 'partner_user',
            },
        ),
    ]