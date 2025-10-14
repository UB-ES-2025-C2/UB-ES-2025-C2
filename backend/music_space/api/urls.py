from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from .views import *

# Create a router and register our ViewSets with it.
router = DefaultRouter()

router.register(r'user', UserViewSet, basename='user')
router.register(r'userprofile', UserProfileViewSet, basename='userprofile')
router.register(r'songs', SongViewSet, basename='song')
router.register(r'playlist', PlayListViewSet, basename='playlist')

playlistRut = NestedSimpleRouter(router, r'playlist', lookup='playlist')
playlistRut.register(r'songs', PlaylistSongViewSet, basename='playlist-song')


urlpatterns = [
    path("", include(router.urls)),
    path("", include(playlistRut.urls)),
]