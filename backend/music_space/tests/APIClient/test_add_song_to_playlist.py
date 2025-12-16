"""Add song to playlist tests."""

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from music_space.api.models import PlayList, PlaylistSong, Song, UserProfile


class PlaylistSongAPITestCase(APITestCase):  # noqa: D101
    def setUp(self) -> None:  # noqa: D102
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

    def test_get_playlist_songs_unauthenticated(self) -> None:  # noqa: D102
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

    def test_get_playlist_songs_authenticated(self) -> None:  # noqa: D102
        response = self.client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    def test_create_playlist_song(self) -> None:  # noqa: D102
        data = {'song_id': self.song1.id, 'position': 1}
        response = self.client.post(self.url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        data2 = {'song_id': self.song2.id}
        response = self.client.post(self.url, data2, format='json')
        assert response.status_code == status.HTTP_201_CREATED

        playlist_song = PlaylistSong.objects.get(
            playlist=self.playlist, song=self.song2
        )
        assert (
            playlist_song.position == 2  # noqa: PLR2004
        )  # perform_create posa count() + 1

        assert 'song_id' not in response.data  # noqa: PLR2004
        assert 'song' in response.data  # noqa: PLR2004
