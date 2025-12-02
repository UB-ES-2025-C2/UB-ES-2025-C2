import pytest

from django.contrib.auth.models import User
from django.test import TestCase

from music_space.api.models import PlayList, UserProfile


@pytest.mark.django_db
class PlayListTestCase(TestCase):
    """Test case for PlayList model deletion functionality."""

    def setUp(self) -> None:
        """Set up a user and user profile for testing."""
        self.user = User.objects.create_user(username="owner", password="pass")  # noqa: S106
        self.profile = UserProfile.objects.get(user=self.user)

    def test_delete_playlist(self) -> None:
        """Test that a playlist can be deleted successfully.

        Verifies that after deleting a playlist, attempting to retrieve it
        by ID raises a PlayList.DoesNotExist exception.
        """
        playlist = PlayList.playListManager.create(
            name="ToDelete",
            description="Will be deleted",
            topic="Genre",
            cover='covers/default.png',
        )
        playlist.owner.add(self.profile)
        playlist_id = playlist.id
        playlist.delete()
        with pytest.raises(PlayList.DoesNotExist):
            PlayList.playListManager.get(id=playlist_id)
