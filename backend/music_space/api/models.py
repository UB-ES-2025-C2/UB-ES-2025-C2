"""models.py"""

from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

# Create your models here.
from django.db import models

from .manager import *


class Song(models.Model):
    """Model de cançó."""

    name = models.CharField(max_length=50)
    artist = models.CharField(max_length=1000)
    topic = models.CharField(max_length=50)
    file_audio = models.FileField(upload_to='songs_folder/')
    cover = models.ImageField(upload_to='covers/', default='covers/default.png')
    authors = models.ManyToManyField('UserProfile', related_name='songs')
    objects = models.Manager()
    songManager = SongManager()  # noqa: N815

    def __str__(self) -> str:
        """
        Representació en cadena de la cançó.

        Returns
        -------
            str: La representació en cadena de la cançó.
        """
        return f"{self.name} by {self.artist}"


class UserProfile(models.Model):
    """Model de perfil d'usuari."""

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=50)
    description = models.CharField(max_length=1000, blank=True, default="")
    profilePic = models.ImageField(  # noqa: N815
        upload_to='profile_pics/', default='profile_pics/default.png'
    )

    def __str__(self) -> str:
        """
        Representació en cadena del perfil d'usuari.

        Returns
        -------
            str: La representació en cadena del perfil d'usuari.
        """
        return self.nickname


class Follow(models.Model):
    """Model de relació de seguiment entre usuaris."""

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

    def __str__(self) -> str:
        """
        Representació en cadena de la relació de seguiment.

        Returns
        -------
            str: La representació en cadena de la relació de seguiment.
        """
        return f"{self.follower} follows {self.followed}"


class PlayList(models.Model):
    """Model de playlist."""

    name = models.CharField(max_length=50)
    description = models.CharField(max_length=1000)
    topic = models.CharField(max_length=50)
    owner = models.ManyToManyField(UserProfile, related_name="own_playlists")
    watched = models.ManyToManyField(UserProfile, related_name="watched", blank=True)
    cover = models.ImageField(upload_to='covers/', default='covers/default.png')
    playListManager = PlayListManager()  # noqa: N815

    def __str__(self) -> str:
        """
        Representació en cadena de la playlist.

        Returns
        -------
            str: La representació en cadena de la playlist.
        """
        return f"Playlist: {self.name} by {', '.join([owner.nickname for owner in self.owner.all()])}"  # noqa: E501


class PlaylistSong(models.Model):
    """Model que relaciona cançons i playlists."""

    position = models.PositiveIntegerField(
        validators=[MinValueValidator(0)], null=True, blank=True
    )
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name="playlist")
    playlist = models.ForeignKey(
        PlayList, on_delete=models.CASCADE, related_name="songs"
    )

    def __str__(self) -> str:
        """
        Representació en cadena de la relació cançó-playlist.

        Returns
        -------
            str: La representació en cadena de la relació cançó-playlist.
        """
        return f"Song: {self.song.name} in Playlist: {self.playlist.name} at position {self.position}"  # noqa: E501


class Comment(models.Model):
    """Model de comentari a una cançó."""

    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="comments"
    )
    content = models.CharField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    annonymus_level = models.IntegerField(default=0)

    def __str__(self) -> str:
        """
        Representació en cadena del comentari.

        Returns
        -------
            str: La representació en cadena del comentari.
        """
        return f"Comment by {self.user.nickname} on {self.song.name}: {self.content}"
