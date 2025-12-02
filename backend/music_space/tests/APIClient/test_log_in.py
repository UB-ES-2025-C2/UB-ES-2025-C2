from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class UserTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="StrongPass123!"
        )
        self.client = APIClient()

    def test_login_user(self):
        data = {
            "username": "testuser",
            "password": "StrongPass123!"
        }
        response = self.client.post("/api/token/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tokens = response.json()
        self.assertIn("access", tokens)
        self.assertIn("refresh", tokens)

        # Utilitza el token per fer una petició autenticada
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        response = self.client.get("/api/v1/userprofile/", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
