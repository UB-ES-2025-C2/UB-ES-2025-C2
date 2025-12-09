"""Tests for UserSerializer."""

from django.test import TestCase

from music_space.api.serializers import UserSerializer


class TestUserSerializer(TestCase):
    """Tests for UserSerializer."""

    def test_create_user_success(self) -> None:  # noqa: PLR6301
        """Test successful user creation."""
        username = "newuser"
        data = {
            "username": username,
            "email": "newuser@example.com",
            "password": "securepass",
            "password_conf": "securepass",
        }
        serializer = UserSerializer(data=data)
        assert serializer.is_valid()
        user = serializer.save()
        assert user.username == username

    def test_create_user_password_mismatch(self) -> None:  # noqa: PLR6301
        """Test user creation fails on password mismatch."""
        data = {
            "username": "failuser",
            "email": "fail@example.com",
            "password": "pass1",
            "password_conf": "pass2",
        }
        serializer = UserSerializer(data=data)
        error = "Passwords don't match"
        assert not serializer.is_valid()
        assert error in str(serializer.errors)
