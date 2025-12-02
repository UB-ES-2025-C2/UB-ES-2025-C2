import pytest

from django.contrib.auth.models import User
from django.test import TestCase

from music_space.api.models import UserProfile
from music_space.api.serializers import UserProfileSerializer


@pytest.mark.django_db
class TestUserProfileSerializer(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.profile = UserProfile.objects.get(user=self.user)

    def test_userprofile_serialization(self):
        serializer = UserProfileSerializer(self.profile)
        data = serializer.data
        self.assertEqual(data["nickname"], self.user.username)
        self.assertEqual(data["user"], self.user.id)
