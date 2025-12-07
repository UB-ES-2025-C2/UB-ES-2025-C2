"""Tests per a la funcionalitat de l'API d'inici de sessió."""

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

access_token = "access"  # noqa: S105
refresh_token = "refresh"  # noqa: S105


class UserTestCase(TestCase):
    """Casos de prova per a la funcionalitat d'inici de sessió d'usuaris."""

    def setUp(self) -> None:
        """Configurar dades de prova."""
        self.user = User.objects.create_user(
            username="testuser",
            password="StrongPass123!",  # noqa: S106
        )
        self.client = APIClient()

    def test_login_user(self) -> None:
        """Provar l'inici de sessió d'un usuari a través de l'API."""
        data = {"username": "testuser", "password": "StrongPass123!"}
        response = self.client.post("/api/token/", data, format="json")
        assert response.status_code == status.HTTP_200_OK
        tokens = response.json()
        assert access_token in tokens
        assert refresh_token in tokens

        # Utilitza el token per fer una petició autenticada
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        response = self.client.get("/api/v1/userprofile/", format="json")
        assert response.status_code == status.HTTP_200_OK
