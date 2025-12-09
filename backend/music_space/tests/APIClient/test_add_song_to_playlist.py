"""Tests for adding songs to playlists via the API."""

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from music_space.api.models import PlayList, PlaylistSong, Song, UserProfile


class PlaylistSongAPITestCase(APITestCase):
    """Test case for PlaylistSong API endpoints."""

    def setUp(self) -> None:
        """Set up test data and authenticate user."""
        self.user = User.objects.create_user(
            username='testuser',
            password='password123',  # noqa: S106
        )
        self.profile = UserProfile.objects.get(user=self.user)

        # Crear playlist propietat per l'usuari
        self.playlist = PlayList.playListManager.create(name='Test Playlist')
        self.playlist.owner.add(self.profile)

        # Crear cançons
        self.song1 = Song.objects.create(
            name='Song One', topic='Pop', artist='Artist A'
        )
        self.song2 = Song.objects.create(
            name='Song Two', topic='Rock', artist='Artist B'
        )

        self.client.force_authenticate(user=self.user)

        # URL base amb playlist_pk
        self.url = reverse(
            'playlist-song-list', kwargs={'playlist_pk': self.playlist.id}
        )

    def test_get_playlist_songs_unauthenticated(self) -> None:
        """Test retrieving playlist songs without authentication."""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

    def test_get_playlist_songs_authenticated(self) -> None:
        """Test retrieving playlist songs with authentication."""
        response = self.client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    def test_create_playlist_song(self) -> None:
        """Test adding songs to a playlist via the API."""
        song_id = 'song_id'
        song = 'song'
        data = {'song_id': self.song1.id, 'position': 1}
        response = self.client.post(self.url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        data2 = {'song_id': self.song2.id}
        response = self.client.post(self.url, data2, format='json')
        assert response.status_code == status.HTTP_201_CREATED

        totalsongs = 2
        playlist_song = PlaylistSong.objects.get(
            playlist=self.playlist, song=self.song2
        )
        assert playlist_song.position == totalsongs  # perform_create posa count() + 1

        assert song_id not in response.data
        assert song in response.data
