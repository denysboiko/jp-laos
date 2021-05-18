# Generated by Django 3.2.3 on 2021-05-18 16:53

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import smart_selects.db_fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='District',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dcode', models.IntegerField()),
                ('name', models.CharField(max_length=120)),
                ('name_l', models.CharField(max_length=120)),
                ('area', models.FloatField()),
            ],
            options={
                'db_table': 'districts',
            },
        ),
        migrations.CreateModel(
            name='ImplementingPartner',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('implementing_partner_name', models.CharField(max_length=120)),
            ],
            options={
                'db_table': 'implementing_partners',
                'ordering': ['implementing_partner_name'],
            },
        ),
        migrations.CreateModel(
            name='Partner',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('partner_name', models.CharField(max_length=80)),
                ('users_access', models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'partners',
            },
        ),
        migrations.CreateModel(
            name='Province',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pcode', models.IntegerField()),
                ('name', models.CharField(max_length=120)),
                ('name_l', models.CharField(max_length=120)),
                ('longitude', models.FloatField()),
                ('latitude', models.FloatField()),
            ],
            options={
                'db_table': 'provinces',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Responsible',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('responsible_name', models.CharField(max_length=80)),
            ],
            options={
                'db_table': 'responsible',
            },
        ),
        migrations.CreateModel(
            name='Sector',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sector_name', models.CharField(max_length=120)),
            ],
            options={
                'db_table': 'sectors',
            },
        ),
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(max_length=50)),
            ],
            options={
                'verbose_name_plural': 'statuses',
                'db_table': 'status',
            },
        ),
        migrations.CreateModel(
            name='Subsector',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('other_subsector_name', models.CharField(max_length=80)),
            ],
            options={
                'db_table': 'subsectors',
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project_code', models.CharField(blank=True, max_length=40, null=True)),
                ('project_title', models.TextField(max_length=280)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(blank=True, default='9999-12-31', null=True)),
                ('planed_amount', models.FloatField()),
                ('implementing_partner', models.ManyToManyField(blank=True, to='jplaos.ImplementingPartner')),
                ('other_subsector', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='jplaos.subsector')),
                ('partner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partner_id', to='jplaos.partner')),
                ('sector', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sector_id', to='jplaos.sector')),
            ],
            options={
                'db_table': 'projects',
            },
        ),
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('districts', smart_selects.db_fields.ChainedManyToManyField(blank=True, chained_field='province', chained_model_field='province', related_name='districs', to='jplaos.District', verbose_name='districts')),
                ('project', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='locations', to='jplaos.project')),
                ('province', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='jplaos.province')),
            ],
            options={
                'db_table': 'location',
            },
        ),
        migrations.AddField(
            model_name='district',
            name='province',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='districts', to='jplaos.province'),
        ),
    ]
