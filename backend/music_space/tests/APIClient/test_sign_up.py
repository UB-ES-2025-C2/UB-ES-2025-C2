from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


class UserTestCase(TestCase):
    def setUp(self):
        # Crear un usuari de prova per a tests
        self.user = User.objects.create_user(
            username="testuser",
            password="StrongPass123!"
        )
        self.client = APIClient()

    def test_signup_user(self):
        data = {
            "username": "newuser",
            "password": "NewPass123!",
            "password_conf": "NewPass123!",
            "email": "newuser@gmail.com"
        }
        response = self.client.post("/api/v1/user/", data, format="json")
        self.assertIn(response.status_code, [200, 201])
