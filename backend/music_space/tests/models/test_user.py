"""Tests for User model and UserProfile creation."""

import pytest

from django.contrib.auth.models import User
from django.test import TestCase

from music_space.api.models import UserProfile


@pytest.mark.django_db
class UserTestCase(TestCase):
    """Tests for User model and UserProfile creation."""

    def test_create_user_and_profile(self) -> None:  # noqa: PLR6301
        """Test creating a User also creates a UserProfile."""
        username = "testuser"
        user = User.objects.create_user(username=username, password="test123")  # noqa: S106
        profile = UserProfile.objects.get(
            user=user
        )  # es recupera el UserProfile creat pel senyal
        assert (
            profile.nickname == username
        )  # el nickname s'ha d'assignar amb el username
        assert profile.user.username == username
