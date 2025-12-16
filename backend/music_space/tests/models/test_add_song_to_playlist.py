import pytest

from django.test import TestCase

from music_space.api.models import PlayList, PlaylistSong, Song


@pytest.mark.django_db
class PlaylistSongTestCase(TestCase):
    def setUp(self):
        self.playlist = PlayList.playListManager.create(name="My playlist")
        self.song = Song.objects.create(
            name="Song1",
            artist="artist",
            topic="pop",
            file_audio='songs_folder/himno_ES.mp3',
            cover='covers/default.png',
        )

    def test_create_playlist_song(self):
        playlist_song = PlaylistSong.objects.create(
            playlist=self.playlist,
            song=self.song,
            position=0,
        )
        self.assertEqual(playlist_song.playlist, self.playlist)
        self.assertEqual(playlist_song.song, self.song)
        self.assertEqual(playlist_song.position, 0)

        self.assertEqual(self.playlist.songs.count(), 1)
        self.assertEqual(self.playlist.songs.first(), playlist_song)
        self.assertEqual(self.song.playlist.count(), 1)
        self.assertEqual(self.song.playlist.first(), playlist_song)
