"""Tests for adding songs to playlists in the models."""

import pytest

from django.test import TestCase

from music_space.api.models import PlayList, PlaylistSong, Song


@pytest.mark.django_db
class PlaylistSongTestCase(TestCase):
    """Test case for adding songs to playlists."""

    def setUp(self) -> None:
        """Set up test data."""
        self.playlist = PlayList.playListManager.create(name="My playlist")
        self.song = Song.objects.create(
            name="Song1",
            artist="artist",
            topic="pop",
            file_audio='songs_folder/himno_ES.mp3',
            cover='covers/default.png',
        )

    def test_create_playlist_song(self) -> None:
        """Test creating a PlaylistSong."""
        playlist_song = PlaylistSong.objects.create(
            playlist=self.playlist,
            song=self.song,
            position=0,
        )
        assert playlist_song.playlist == self.playlist
        assert playlist_song.song == self.song
        assert playlist_song.position == 0

        assert self.playlist.songs.count() == 1
        assert self.playlist.songs.first() == playlist_song
        assert self.song.playlist.count() == 1
        assert self.song.playlist.first() == playlist_song
