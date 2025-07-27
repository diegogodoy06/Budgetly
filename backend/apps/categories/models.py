from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Category(models.Model):
    """Modelo para categorias de transações"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6366f1', help_text="Cor em formato hexadecimal")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ['user', 'name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Tag(models.Model):
    """Modelo para tags de transações"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ['user', 'name']

    def __str__(self):
        return self.name
