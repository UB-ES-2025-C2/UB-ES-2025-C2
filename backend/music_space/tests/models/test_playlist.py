"""Tests for PlayList model."""

import pytest

from django.contrib.auth.models import User
from django.test import TestCase

from music_space.api.models import PlayList, UserProfile


@pytest.mark.django_db
class PlayListTestCase(TestCase):
    """Tests for PlayList model."""

    def setUp(self) -> None:
        """Set up a user and profile for testing."""
        self.user = User.objects.create_user(username="owner", password="pass")  # noqa: S106
        self.profile = UserProfile.objects.get(user=self.user)

    def test_create_playlist_and_add_owner(self) -> None:
        """Test creating a PlayList and adding an owner."""
        playlistname = "MyPlaylist"
        playlist = PlayList.playListManager.create(
            name=playlistname,
            description="Description here",
            topic="Genre",
            cover='covers/default.png',
        )
        playlist.owner.add(self.profile)
        assert self.profile in playlist.owner.all()
        assert playlist.name == playlistname
