"""Tests for the documentation endpoint."""

from django.test import TestCase

HTTP_OK = 200


class DocumentationTestCase(TestCase):
    """Test the /docs/ endpoint."""

    def test_get(self) -> None:
        """Test GET /docs/."""
        response = self.client.get("/docs/")
        assert response.status_code == HTTP_OK
