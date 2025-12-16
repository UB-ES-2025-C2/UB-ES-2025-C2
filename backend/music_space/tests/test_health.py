"""Tests for the health endpoint of the music_space backend.

This module contains:
- HealthTestCase: verifies that a GET request to /ht/ returns HTTP 200 OK.
"""

from django.test import TestCase

HTTP_OK = 200


class HealthTestCase(TestCase):
    """Tests for the /ht/ health endpoint."""

    def test_get(self) -> None:
        """Test that a GET request to /ht/ returns HTTP 200 OK."""
        response = self.client.get("/ht/")
        assert response.status_code == HTTP_OK
