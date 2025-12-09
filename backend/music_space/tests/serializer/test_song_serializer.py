"""Tests for the SongSerializer in the music_space application."""

import shutil
import tempfile

from io import BytesIO

import pytest

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from music_space.api.models import UserProfile
from music_space.api.serializers import SongSerializer

TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@pytest.mark.django_db
@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class TestSongSerializer(TestCase):
    """Tests for the SongSerializer."""

    @classmethod
    def tearDownClass(cls) -> None:
        """Clean up temporary media root after tests."""
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self) -> None:
        """Set up a user and profile for testing."""
        self.user = User.objects.create_user(username="artist", password="pass")  # noqa: S106
        self.profile = UserProfile.objects.get(user=self.user)

    def test_create_song(self) -> None:
        """Test creating a song with the SongSerializer."""
        songname = "TestSong"
        audio_file = SimpleUploadedFile(
            "test.mp3",
            b'123',
            content_type="audio/mpeg",
        )
        image_io = BytesIO()
        image = Image.new('RGB', (1, 1), color='white')
        image.save(image_io, format='PNG')
        image_io.seek(0)
        cover_file = SimpleUploadedFile(
            'test.png', image_io.read(), content_type='image/png'
        )
        data = {
            "name": songname,
            "artist": "ArtistName",
            "topic": "Rock",
            "authors": [self.profile.id],
            "file_audio": audio_file,
            "cover": cover_file,
        }
        serializer = SongSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        song = serializer.save()
        assert song.name == songname
        assert self.profile in song.authors.all()
        audio_file.close()
        cover_file.close()
