from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

# Create your models here.
from django.db import models

from .manager import *  # noqa: F403

class Song(models.Model):
    name = models.CharField(max_length=50)
    artist = models.CharField(max_length=1000)
    topic = models.CharField(max_length=50)
    file_audio = models.FileField(upload_to='songs_folder/')
    cover = models.ImageField(upload_to='covers/', default='covers/default.png')
    authors = models.ManyToManyField('UserProfile', related_name='songs')
    objects = models.Manager()
    songManager = SongManager()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=50)
    description = models.CharField(max_length=1000, blank=True, default="")
    profilePic = models.ImageField(
        upload_to='profile_pics/', default='profile_pics/default.png'
    )


class Follow(models.Model):
    follower = models.ForeignKey(
        UserProfile,
        related_name="following",
        on_delete=models.CASCADE,
    )
    followed = models.ForeignKey(
        UserProfile,
        related_name="followers",
        on_delete=models.CASCADE,
    )
    date_added = models.DateTimeField(auto_now_add=True)


class PlayList(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=1000)
    topic = models.CharField(max_length=50)
    owner = models.ManyToManyField(UserProfile, related_name="own_playlists")
    watched = models.ManyToManyField(UserProfile, related_name="watched", blank=True)
    cover = models.ImageField(upload_to='covers/', default='covers/default.png')
    playListManager = PlayListManager()


class PlaylistSong(models.Model):
    position = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    song = models.ForeignKey(Song,
                           on_delete=models.CASCADE,
                           related_name="playlist")
    playlist = models.ForeignKey(PlayList,
                               on_delete=models.CASCADE,
                               related_name="songs")

class Comment(models.Model):
    song = models.ForeignKey(
        Song,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    content = models.CharField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    annonymus_level = models.IntegerField(default=0)

