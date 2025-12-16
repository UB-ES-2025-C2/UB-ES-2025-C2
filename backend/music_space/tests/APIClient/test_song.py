"""Tests for the Song API endpoints."""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from music_space.api.models import Song, User, UserProfile

songname1 = "Song One"
songname2 = "Song Two"
number_of_songs = 2
artist1 = "Artist A"
artist2 = "Artist B"


class SongAPITestCase(APITestCase):
    """Test cases for the Song API endpoints."""

    def setUp(self) -> None:
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            password='password123',  # noqa: S106
        )
        self.profile = UserProfile.objects.get(user=self.user)

        # Crear algunes cançons
        self.song1 = Song.objects.create(name=songname1, topic='Pop', artist=artist1)
        self.song2 = Song.objects.create(name=songname2, topic='Rock', artist=artist2)
        self.song1.authors.add(self.profile)
        self.song2.authors.add(self.profile)

    def test_get_all_songs(self) -> None:
        """Test retrieving all songs."""
        url = reverse('song-list')  # Nom del basename del router
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == number_of_songs
        assert response.data[0]['name'] == songname1
        assert response.data[1]['name'] == songname2

    def test_get_songs_with_name_filter(self) -> None:
        """Test retrieving songs with name filter."""
        url = reverse('song-list')
        response = self.client.get(url, {'name': 'Song One'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['name'] == songname1

    def test_get_songs_with_artist_filter(self) -> None:
        """Test retrieving songs with artist filter."""
        url = reverse('song-list')
        response = self.client.get(url, {'artist': artist2})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['artist'] == artist2
