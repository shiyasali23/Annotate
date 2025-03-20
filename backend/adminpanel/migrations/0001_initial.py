# Generated by Django 5.1.6 on 2025-03-20 00:28

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Food',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255, unique=True)),
                ('nutriscore', models.FloatField(blank=True, null=True)),
                ('normalized_nutriscore', models.FloatField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255, unique=True)),
            ],
            options={
                'indexes': [models.Index(fields=['name'], name='adminpanel__name_0b3e6c_idx')],
            },
        ),
        migrations.CreateModel(
            name='Biochemical',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255, unique=True)),
                ('female_min', models.FloatField()),
                ('female_max', models.FloatField()),
                ('male_min', models.FloatField()),
                ('male_max', models.FloatField()),
                ('validity_days', models.FloatField()),
                ('unit', models.CharField(default='g/dL', max_length=50)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='biochemicals', to='adminpanel.category')),
            ],
        ),
        migrations.CreateModel(
            name='Condition',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255, unique=True)),
            ],
            options={
                'indexes': [models.Index(fields=['name'], name='adminpanel__name_069433_idx')],
            },
        ),
        migrations.CreateModel(
            name='BiochemicalCondition',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_hyper', models.BooleanField()),
                ('biochemical', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conditions', to='adminpanel.biochemical')),
                ('condition', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='adminpanel.condition')),
            ],
        ),
        migrations.CreateModel(
            name='FoodWeight',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('bias', models.FloatField(blank=True, null=True)),
                ('weight', models.FloatField(blank=True, null=True)),
                ('biochemical', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='food_weights', to='adminpanel.biochemical')),
                ('food', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='weights', to='adminpanel.food')),
            ],
        ),
        migrations.CreateModel(
            name='Nutrient',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255, unique=True)),
                ('unit', models.CharField(max_length=50)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='nutrients', to='adminpanel.category')),
            ],
        ),
        migrations.CreateModel(
            name='FoodNutrient',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('value', models.FloatField()),
                ('normalized_value', models.FloatField(blank=True, null=True)),
                ('food', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='nutrients', to='adminpanel.food')),
                ('nutrient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='foods', to='adminpanel.nutrient')),
            ],
        ),
        migrations.CreateModel(
            name='NutrientWeight',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('bias', models.FloatField(blank=True, null=True)),
                ('weight', models.FloatField(blank=True, null=True)),
                ('biochemical', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='nutrient_weights', to='adminpanel.biochemical')),
                ('nutrient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='weights', to='adminpanel.nutrient')),
            ],
        ),
        migrations.CreateModel(
            name='SubCategory',
            fields=[
                ('id', models.BigAutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255, unique=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subcategories', to='adminpanel.category')),
            ],
        ),
        migrations.AddField(
            model_name='food',
            name='subcategory',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='foods', to='adminpanel.subcategory'),
        ),
        migrations.AddIndex(
            model_name='biochemical',
            index=models.Index(fields=['name'], name='adminpanel__name_5fdc55_idx'),
        ),
        migrations.AddIndex(
            model_name='biochemical',
            index=models.Index(fields=['category'], name='adminpanel__categor_e66ea5_idx'),
        ),
        migrations.AddIndex(
            model_name='biochemicalcondition',
            index=models.Index(fields=['biochemical', 'condition', 'is_hyper'], name='adminpanel__biochem_e609a9_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='biochemicalcondition',
            unique_together={('biochemical', 'condition', 'is_hyper')},
        ),
        migrations.AddIndex(
            model_name='foodweight',
            index=models.Index(fields=['biochemical', 'food', 'bias', 'weight'], name='adminpanel__biochem_3cc6b0_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='foodweight',
            unique_together={('biochemical', 'food')},
        ),
        migrations.AddIndex(
            model_name='nutrient',
            index=models.Index(fields=['name'], name='adminpanel__name_105f89_idx'),
        ),
        migrations.AddIndex(
            model_name='nutrient',
            index=models.Index(fields=['category'], name='adminpanel__categor_4af687_idx'),
        ),
        migrations.AddIndex(
            model_name='foodnutrient',
            index=models.Index(fields=['food', 'nutrient'], name='adminpanel__food_id_8615c7_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='foodnutrient',
            unique_together={('food', 'nutrient')},
        ),
        migrations.AddIndex(
            model_name='nutrientweight',
            index=models.Index(fields=['biochemical', 'nutrient', 'bias', 'weight'], name='adminpanel__biochem_64eed1_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='nutrientweight',
            unique_together={('biochemical', 'nutrient')},
        ),
        migrations.AddIndex(
            model_name='subcategory',
            index=models.Index(fields=['name'], name='adminpanel__name_67236d_idx'),
        ),
        migrations.AddIndex(
            model_name='subcategory',
            index=models.Index(fields=['category'], name='adminpanel__categor_e9887c_idx'),
        ),
        migrations.AddIndex(
            model_name='subcategory',
            index=models.Index(fields=['category', 'name'], name='adminpanel__categor_da0331_idx'),
        ),
        migrations.AddIndex(
            model_name='food',
            index=models.Index(fields=['name'], name='adminpanel__name_2227d1_idx'),
        ),
        migrations.AddIndex(
            model_name='food',
            index=models.Index(fields=['subcategory'], name='adminpanel__subcate_34ec61_idx'),
        ),
    ]
