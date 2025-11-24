import shutil
import tempfile
from io import BytesIO
from PIL import Image

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.contrib.auth.models import User

from music_space.api.models import UserProfile, Song, PlayList

TEMP_MEDIA_ROOT = tempfile.mkdtemp()

@pytest.mark.django_db
@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class TestPlayListSerializer(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.user = User.objects.create_user(username="artist", password="pass")
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
            'test.png',
            image_io.read(),
            content_type='image/png'
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

    def test_create_playlist(self):
        image_io = BytesIO()
        image = Image.new('RGB', (1, 1), color='white')
        image.save(image_io, format='PNG')
        image_io.seek(0)
        cover_file = SimpleUploadedFile(
            'playlist.png',
            image_io.read(),
            content_type='image/png'
        )

        playlist = PlayList.playListManager.create(
            name="MyPlaylist",
            description="Playlist de test",
            topic="Rock",
            cover=cover_file
        )
        playlist.owner.add(self.profile)
        playlist.songs.create(song=self.song, position=0)

        assert playlist.name == "MyPlaylist"
        assert self.profile in playlist.owner.all()
        assert playlist.songs.count() == 1
        assert playlist.songs.first().song == self.song

        cover_file.close()
