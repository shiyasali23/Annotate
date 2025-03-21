# Generated by Django 5.1.6 on 2025-03-20 23:45

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Prediction',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('model_id', models.CharField(max_length=100)),
                ('prediction', models.JSONField()),
                ('probability', models.JSONField(blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
