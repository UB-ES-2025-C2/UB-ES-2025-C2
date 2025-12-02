from django.test import TestCase

from music_space.api.serializers import UserSerializer


class TestUserSerializer(TestCase):
    def test_create_user_success(self):
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepass",
            "password_conf": "securepass"
        }
        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, "newuser")

    def test_create_user_password_mismatch(self):
        data = {
            "username": "failuser",
            "email": "fail@example.com",
            "password": "pass1",
            "password_conf": "pass2"
        }
        serializer = UserSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("Passwords don't match", str(serializer.errors))
