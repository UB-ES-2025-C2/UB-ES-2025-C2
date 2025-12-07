"""Tests per a la funcionalitat de l'API de playlists."""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from music_space.api.models import PlayList, User, UserProfile

name_playlist1 = "Chill"
name_playlist2 = "RockHits"
number_of_playlists = 2


class PlaylistAPITestCase(APITestCase):
    """Casos de prova per a la funcionalitat de l'API de playlists."""

    def setUp(self) -> None:
        """Configurar dades de prova."""
        self.user = User.objects.create_user(
            username='testuser',
            password='password123',  # noqa: S106
        )
        self.profile = UserProfile.objects.get(user=self.user)
        self.client = APIClient()

        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Playlists
        self.playlist1 = PlayList.playListManager.create(name="Chill", topic="Relax")
        self.playlist1.owner.add(self.profile)

        self.playlist2 = PlayList.playListManager.create(name="RockHits", topic="Rock")
        self.playlist2.owner.add(self.profile)
        total_playlists = 2
        assert PlayList.playListManager.count() == total_playlists

    def test_get_all_playlists(self) -> None:
        """Provar obtenir totes les playlists."""
        url = reverse("playlist-list")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == PlayList.playListManager.count()

        names = [p["name"] for p in response.data]
        assert name_playlist1 in names
        assert name_playlist2 in names

    def test_get_playlists_filtered_by_name(self) -> None:
        """Provar obtenir playlists filtrades per nom."""
        url = reverse("playlist-list") + "?name=Chill"
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == name_playlist1

    def test_get_playlists_of_a_specific_user(self) -> None:
        """Provar obtenir les playlists d'un usuari específic."""
        url = reverse("playlist-user-list", kwargs={"userprofile_pk": self.profile.id})
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == number_of_playlists

        owner_ids = [pl["owner"][0] for pl in response.data]
        assert all(o == self.profile.id for o in owner_ids)
