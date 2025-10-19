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

    # Ruta personalizada para buscar el usuario por su nombre de usuario
    path("userprofile/by-username/<str:username>/", UserProfileByUsernameView.as_view(), name="userprofile-by-username"),

    # Ruta para buscar usuarios por username
    path("search/user/", UsernameSearchView.as_view(), name="username-search"),

    # Ruta personalizada para buscar canciones por título
    path("songs/by-name/<str:name>/", SongByNameView.as_view(), name="song-by-name"),

    # Ruta para buscar canciones por título
    path("search/song/", SongNameSearchView.as_view(), name="song-name-search"),
]