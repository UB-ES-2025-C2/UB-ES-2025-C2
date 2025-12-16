"""Test add song to playlist."""
import pytest

from django.test import TestCase

from music_space.api.models import PlayList, PlaylistSong, Song
from music_space.api.serializers import PlayListSongSerializer


@pytest.mark.django_db
class TestPlayListSongSerializer(TestCase):  # noqa: D101
    def setUp(self) -> None:  # noqa: D102
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

    def test_serialization(self) -> None:  # noqa: D102
        serializer = PlayListSongSerializer(self.playlist_song)
        data = serializer.data

        assert data["id"] == self.playlist_song.id
        assert data["position"] == self.playlist_song.position
        assert data["song"]["id"] == self.song.id

    def test_deserialization_and_create(self) -> None:  # noqa: D102
        data = {
            "song_id": self.song.id,
            "position": 2,
        }
        serializer = PlayListSongSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

        playlist_song = serializer.save(playlist=self.playlist)

        assert playlist_song.song.id == self.song.id
        assert playlist_song.position == 2  # noqa: PLR2004
        assert playlist_song.playlist == self.playlist
