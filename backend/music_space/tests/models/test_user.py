import pytest
from django.contrib.auth.models import User
from django.test import TestCase
from music_space.api.models import UserProfile
@pytest.mark.django_db
class UserTestCase(TestCase):

    def test_create_user_and_profile(self):
        user = User.objects.create_user(username="testuser", password="test123")
        profile = UserProfile.objects.get(user=user)  # es recupera el UserProfile creat pel senyal
        self.assertEqual(profile.nickname, "testuser")  # el nickname s'ha d'assignar en el senyal amb el username
        self.assertEqual(profile.user.username, "testuser")
