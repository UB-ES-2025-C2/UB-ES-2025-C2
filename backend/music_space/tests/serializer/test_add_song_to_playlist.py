"""Tests for PlayListSongSerializer."""

import pytest

from django.test import TestCase

from music_space.api.models import PlayList, PlaylistSong, Song
from music_space.api.serializers import PlayListSongSerializer


@pytest.mark.django_db
class TestPlayListSongSerializer(TestCase):
    """Tests for PlayListSongSerializer."""

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
        self.playlist_song = PlaylistSong.objects.create(
            playlist=self.playlist,
            song=self.song,
            position=1,
        )

    def test_serialization(self) -> None:
        """Test serialization of PlaylistSong."""
        serializer = PlayListSongSerializer(self.playlist_song)
        data = serializer.data

        assert data["id"] == self.playlist_song.id
        assert data["position"] == self.playlist_song.position
        assert data["song"]["id"] == self.song.id

    def test_deserialization_and_create(self) -> None:
        """Test deserialization and creation of PlaylistSong."""
        songposition = 2
        data = {
            "song_id": self.song.id,
            "position": songposition,
        }
        serializer = PlayListSongSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

        playlist_song = serializer.save(playlist=self.playlist)

        assert playlist_song.song.id == self.song.id
        assert playlist_song.position == songposition
        assert playlist_song.playlist == self.playlist
