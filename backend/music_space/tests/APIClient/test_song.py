from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from music_space.api.models import Song, User, UserProfile


class SongAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.profile = UserProfile.objects.get(user=self.user)

        # Crear algunes cançons
        self.song1 = Song.objects.create(name='Song One', topic='Pop', artist='Artist A')
        self.song2 = Song.objects.create(name='Song Two', topic='Rock', artist='Artist B')
        self.song1.authors.add(self.profile)
        self.song2.authors.add(self.profile)

    def test_get_all_songs(self):
        url = reverse('song-list')  # Nom del basename del router
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['name'], 'Song One')
        self.assertEqual(response.data[1]['name'], 'Song Two')

    def test_get_songs_with_name_filter(self):
        url = reverse('song-list')
        response = self.client.get(url, {'name': 'Song One'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Song One')

    def test_get_songs_with_artist_filter(self):
        url = reverse('song-list')
        response = self.client.get(url, {'artist': 'Artist B'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['artist'], 'Artist B')
