"""Delete playlist test."""

import pytest

from django.contrib.auth.models import User
from django.test import TestCase

from music_space.api.models import PlayList, PlaylistSong, Song, UserProfile


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

    def test_delete_song_from_playlist(self) -> None:
        """Test that a song can be removed from a playlist.

        Verifies that after removing a song from a playlist, the song is no
        longer present in the playlist's songs.
        """
        playlist = PlayList.playListManager.create(
            name="MyPlaylist",
            description="A sample playlist",
            topic="Genre",
            cover='covers/default.png',
        )
        playlist.owner.add(self.profile)

        song = Song.objects.create(
            name="Sample Song",
            artist="Sample Artist",
            topic="Sample Topic",
            file_audio="songs_folder/sample.mp3",
            cover="covers/default.png",
        )

        playlistsong = PlaylistSong.objects.create(
            song=song,
            playlist=playlist,
        )
        playlistsong.save()
        playlistsong.delete()
        songs_in_playlist = playlist.songs.all()
        assert song not in [ps.song for ps in songs_in_playlist]
