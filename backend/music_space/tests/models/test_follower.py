"""Tests for the Follow model in the music_space application."""

import pytest

from django.contrib.auth.models import User
from django.test import TestCase

from music_space.api.models import Follow, UserProfile


@pytest.mark.django_db
class FollowTestCase(TestCase):
    """Tests for the Follow model."""

    def setUp(self) -> None:
        """Set up two users and their profiles for testing."""
        self.u1 = User.objects.create_user(username="a", password="x")  # noqa: S106
        self.u2 = User.objects.create_user(username="b", password="x")  # noqa: S106
        self.p1 = UserProfile.objects.get(user=self.u1)
        self.p1.nickname = "A"
        self.p1.save()
        self.p2 = UserProfile.objects.get(user=self.u2)
        self.p2.nickname = "B"
        self.p2.save()

    def test_follow_relationship(self) -> None:
        """Test creating a follow relationship between two profiles."""
        Follow.objects.create(follower=self.p1, followed=self.p2)
        assert Follow.objects.filter(follower=self.p1, followed=self.p2).exists()
