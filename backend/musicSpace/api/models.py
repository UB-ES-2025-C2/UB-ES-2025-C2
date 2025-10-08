from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=50)
    description= models.CharField(max_length=1000, blank=True, default="")
    profilePic = models.CharField(max_length=1000, blank=True, default="")



class PlayList(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=1000)
    topic = models.CharField(max_length=50)
    owner =  models.ManyToManyField(UserProfile, related_name="owner")
    watched =  models.ManyToManyField(UserProfile, related_name="watched", blank=True)

class Song(models.Model):
    name = models.CharField(max_length=50)
    artist = models.CharField(max_length=1000) # nom artistes
    topic = models.CharField(max_length=50) # topic en llista de topics
    author = models.ForeignKey(UserProfile, related_name="author", on_delete=models.SET_NULL, blank=True, null=True)
    file_audio = models.FileField(upload_to='uploads/')
    playlists = models.ManyToManyField(PlayList, related_name="playlists", blank=True)
