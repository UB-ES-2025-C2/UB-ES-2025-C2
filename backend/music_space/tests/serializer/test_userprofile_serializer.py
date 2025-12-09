"""Tests for UserProfileSerializer."""

import pytest

from django.contrib.auth.models import User
from django.test import TestCase

from music_space.api.models import UserProfile
from music_space.api.serializers import UserProfileSerializer


@pytest.mark.django_db
class TestUserProfileSerializer(TestCase):
    """Tests for UserProfileSerializer."""

    def setUp(self) -> None:
        """Set up test data."""
        self.user = User.objects.create_user(username="testuser", password="testpass")  # noqa: S106
        self.profile = UserProfile.objects.get(user=self.user)

    def test_userprofile_serialization(self) -> None:
        """Test serialization of UserProfile."""
        serializer = UserProfileSerializer(self.profile)
        data = serializer.data
        assert data["nickname"] == self.user.username
        assert data["user"] == self.user.id
