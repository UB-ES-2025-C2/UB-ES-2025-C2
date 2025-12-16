"""Tests for PlayList serializer."""

import shutil
import tempfile

from io import BytesIO

import pytest

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from music_space.api.models import PlayList, Song, UserProfile

TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@pytest.mark.django_db
@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class TestPlayListSerializer(TestCase):
    """Tests for PlayList serializer."""

    @classmethod
    def tearDownClass(cls) -> None:
        """Clean up the temporary media root after tests."""
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self) -> None:
        """Set up test data."""
        self.user = User.objects.create_user(username="artist", password="pass")  # noqa: S106
        self.profile = UserProfile.objects.get(user=self.user)

        # Crear una cançó dummy
        audio_file = SimpleUploadedFile(
            "test.mp3",
            b'123',  # contingut dummy
            content_type="audio/mpeg",
        )
        image_io = BytesIO()
        image = Image.new('RGB', (1, 1), color='white')
        image.save(image_io, format='PNG')
        image_io.seek(0)
        cover_file = SimpleUploadedFile(
            'test.png', image_io.read(), content_type='image/png'
        )

        self.song = Song.objects.create(
            name="TestSong",
            artist="ArtistName",
            topic="Rock",
            file_audio=audio_file,
            cover=cover_file,
        )
        self.song.authors.add(self.profile)
        audio_file.close()
        cover_file.close()

    def test_create_playlist(self) -> None:
        """Test creating a PlayList with cover and songs."""
        image_io = BytesIO()
        image = Image.new('RGB', (1, 1), color='white')
        image.save(image_io, format='PNG')
        image_io.seek(0)
        cover_file = SimpleUploadedFile(
            'playlist.png', image_io.read(), content_type='image/png'
        )

        playlistmame = "MyPlaylist"
        playlist = PlayList.playListManager.create(
            name=playlistmame,
            description="Playlist de test",
            topic="Rock",
            cover=cover_file,
        )
        playlist.owner.add(self.profile)
        playlist.songs.create(song=self.song, position=0)

        assert playlist.name == playlistmame
        assert self.profile in playlist.owner.all()
        assert playlist.songs.count() == 1
        assert playlist.songs.first().song == self.song

        cover_file.close()
