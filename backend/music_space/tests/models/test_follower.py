import pytest
from django.contrib.auth.models import User
from django.test import TestCase
from music_space.api.models import UserProfile, Follow

@pytest.mark.django_db
class FollowTestCase(TestCase):
    def setUp(self):
        self.u1 = User.objects.create_user(username="a", password="x")
        self.u2 = User.objects.create_user(username="b", password="x")
        self.p1 = UserProfile.objects.get(user=self.u1)
        self.p1.nickname = "A"
        self.p1.save()
        self.p2 = UserProfile.objects.get(user=self.u2)
        self.p2.nickname = "B"
        self.p2.save()
    def test_follow_relationship(self):
        Follow.objects.create(follower=self.p1, followed=self.p2)
        self.assertTrue(Follow.objects.filter(follower=self.p1, followed=self.p2).exists())
