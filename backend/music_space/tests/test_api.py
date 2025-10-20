from django.test import TestCase

# Python
from PIL import Image
import tempfile
import json

# Django Rest Framework
from rest_framework.test import APIClient
from rest_framework import status


# Models
from saved.battleship.api.models import Player, Shot
from saved.battleship.api.models import User


class UserTestCase(TestCase):
    def setUp(self):
        pass

    def test_signup_user(self):
        pass
