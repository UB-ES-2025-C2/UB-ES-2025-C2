from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from music_space.api.models import PlayList, User, UserProfile


class PlaylistAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
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

    def test_get_all_playlists(self):
        url = reverse("playlist-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        names = [p["name"] for p in response.data]
        self.assertIn("Chill", names)
        self.assertIn("RockHits", names)

    def test_get_playlists_filtered_by_name(self):
        url = reverse("playlist-list") + "?name=Chill"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Chill")

    def test_get_playlists_of_a_specific_user(self):
        url = reverse("playlist-user-list", kwargs={"userprofile_pk": self.profile.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        owner_ids = [pl["owner"][0] for pl in response.data]
        self.assertTrue(all(o == self.profile.id for o in owner_ids))
