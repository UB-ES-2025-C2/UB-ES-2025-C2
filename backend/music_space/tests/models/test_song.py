import pytest
from django.contrib.auth.models import User
from django.test import TestCase
from music_space.api.models import UserProfile, Song

@pytest.mark.django_db
class SongTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="artist", password="pass")
        self.profile = UserProfile.objects.get(user=self.user)

    def test_create_song_with_authors(self):
        song = Song.objects.create(
            name="Song1",
            artist="artist",
            topic="pop",
            file_audio='songs_folder/himno_ES.mp3',
            cover='covers/default.png'
        )
        song.authors.add(self.profile)
        self.assertEqual(song.name, "Song1")
        self.assertEqual(song.authors.count(), 1)
