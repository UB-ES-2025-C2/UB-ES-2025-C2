import pytest
from django.contrib.auth.models import User
from django.test import TestCase
from music_space.api.models import UserProfile, Song, PlayList

@pytest.mark.django_db
class PlayListTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="pass")
        self.profile = UserProfile.objects.get(user=self.user)

    def test_create_playlist_and_add_owner(self):
        playlist = PlayList.playListManager.create(
            name="MyPlaylist",
            description="Description here",
            topic="Genre",
            cover='covers/default.png'
        )
        playlist.owner.add(self.profile)
        self.assertIn(self.profile, playlist.owner.all())
        self.assertEqual(playlist.name, "MyPlaylist")
