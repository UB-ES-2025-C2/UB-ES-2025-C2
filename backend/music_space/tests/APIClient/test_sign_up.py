"""Tests per a la funcionalitat de registre d'usuaris a través de l'API."""

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

good_codes = [200, 201]


class UserTestCase(TestCase):
    """Casos de prova per a la funcionalitat de registre d'usuaris."""

    def setUp(self) -> None:
        """Configurar dades de prova."""
        # Crear un usuari de prova per a tests
        self.user = User.objects.create_user(
            username="testuser",
            password="StrongPass123!",  # noqa: S106
        )
        self.client = APIClient()

    def test_signup_user(self) -> None:
        """Provar el registre d'un nou usuari a través de l'API."""
        data = {
            "username": "newuser",
            "password": "NewPass123!",
            "password_conf": "NewPass123!",
            "email": "newuser@gmail.com",
        }
        response = self.client.post("/api/v1/user/", data, format="json")
        assert response.status_code in good_codes
