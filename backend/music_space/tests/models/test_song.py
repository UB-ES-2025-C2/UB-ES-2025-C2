"""Tests for Song model."""

import pytest

from django.contrib.auth.models import User
from django.test import TestCase

from music_space.api.models import Song, UserProfile


@pytest.mark.django_db
class SongTestCase(TestCase):
    """Tests for Song model."""

    def setUp(self) -> None:
        """Set up a user and profile for testing."""
        self.user = User.objects.create_user(username="artist", password="pass")  # noqa: S106
        self.profile = UserProfile.objects.get(user=self.user)

    def test_create_song_with_authors(self) -> None:
        """Test creating a Song with authors."""
        songname = "Song1"
        song = Song.objects.create(
            name=songname,
            artist="artist",
            topic="pop",
            file_audio='songs_folder/himno_ES.mp3',
            cover='covers/default.png',
        )
        song.authors.add(self.profile)
        assert song.name == songname
        assert song.authors.count() == 1
