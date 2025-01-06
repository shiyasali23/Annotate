from django.db import models
import uuid


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,unique=True,editable=False,)
    created = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        abstract = True

class Category(BaseModel):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        indexes = [models.Index(fields=['name'])]

class SubCategory(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    class Meta:
        indexes = [models.Index(fields=['name']), models.Index(fields=['category'])]

class Condition(BaseModel):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        indexes = [models.Index(fields=['name'])]

class Biochemical(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='biochemicals')
    female_min = models.FloatField()
    female_max = models.FloatField()
    male_min = models.FloatField()
    male_max = models.FloatField()
    validity_days = models.FloatField()
    unit = models.CharField(max_length=50, default='g/dL')

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    class Meta:
        indexes = [models.Index(fields=['name']), models.Index(fields=['category'])]

class BiochemicalCondition(BaseModel):
    biochemical = models.ForeignKey(Biochemical, on_delete=models.CASCADE, related_name='conditions')
    condition = models.ForeignKey(Condition, on_delete=models.CASCADE)
    is_hyper = models.BooleanField()

    def __str__(self):
        hyper_status = "Hyper" if self.is_hyper else "Hypo"
        return f"{self.biochemical.name} - {self.condition.name} ({hyper_status})"

    class Meta:
        unique_together = ('biochemical', 'condition', 'is_hyper')
        indexes = [models.Index(fields=['biochemical', 'condition', 'is_hyper'])]

class Food(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name='foods')
    nutriscore = models.FloatField(null=True, blank=True)
    normalized_nutriscore = models.FloatField(null=True, blank=True)  

    def __str__(self):
        return self.name

    class Meta:
        indexes = [models.Index(fields=['name']), models.Index(fields=['subcategory'])]

class FoodImage(BaseModel):
    food = models.OneToOneField(Food, on_delete=models.CASCADE, related_name='image')
    image = models.ImageField(upload_to='food_images/')

    def __str__(self):
        return self.food.name

    class Meta:
        indexes = [
            models.Index(fields=['food']),
        ]
        


class Nutrient(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='nutrients')
    unit = models.CharField(max_length=50)

    def __str__(self):
        return self.name

    class Meta:
        indexes = [models.Index(fields=['name']), models.Index(fields=['category'])]

class FoodNutrient(BaseModel):
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='nutrients')
    nutrient = models.ForeignKey(Nutrient, on_delete=models.CASCADE, related_name='foods')
    value = models.FloatField()
    normalized_value = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.food.name} - {self.nutrient.name}: {self.value} {self.nutrient.unit}"

    class Meta:
        unique_together = ('food', 'nutrient')
        indexes = [models.Index(fields=['food', 'nutrient'])]
   

    
    

class FoodWeight(BaseModel):
    biochemical = models.ForeignKey(Biochemical, on_delete=models.CASCADE, related_name='food_weights')
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='weights')
    bias = models.FloatField(null=True, blank=True)  
    weight = models.FloatField(null=True, blank=True)  

    def __str__(self):
        return f"{self.food.name} - {self.biochemical.name} : {self.bias} - {self.weight}"

    class Meta:
        unique_together = ('biochemical', 'food')
        indexes = [models.Index(fields=['biochemical', 'food', 'bias', 'weight'])]

class NutrientWeight(BaseModel):
    biochemical = models.ForeignKey(Biochemical, on_delete=models.CASCADE, related_name='nutrient_weights')
    nutrient = models.ForeignKey(Nutrient, on_delete=models.CASCADE, related_name='weights')
    bias = models.FloatField(null=True, blank=True)  
    weight = models.FloatField(null=True, blank=True)  

    def __str__(self):
        return f"{self.nutrient.name} - {self.biochemical.name} : {self.bias} - {self.weight}"

    class Meta:
        unique_together = ('biochemical', 'nutrient')
        indexes = [models.Index(fields=['biochemical', 'nutrient', 'bias', 'weight'])]
