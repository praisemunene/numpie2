from django.db import models

class UserProfile(models.Model):
    username = models.CharField(max_length=100)
    number = models.CharField(max_length=20)
    email = models.EmailField(max_length=100)
    country = models.CharField(max_length=100)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username
