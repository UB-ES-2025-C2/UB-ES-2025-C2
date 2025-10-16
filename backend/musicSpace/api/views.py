from django.contrib.auth.models import User
from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt import authentication
from rest_framework.views import APIView

from . import serializers
from .serializers import *
from rest_framework import mixins


class UserViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve` actions.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    filter_backends = [filters.SearchFilter]


class PlayListViewSet(viewsets.ModelViewSet):
    queryset = PlayList.objects.all()
    serializer_class = PlayListSerializer


class PlaylistSongViewSet(viewsets.ViewSet):
    """
    Gestiona les cançons dins d’una playlist
    """
    def list(self, request, playlist_pk=None):
        playlist = get_object_or_404(PlayList, pk=playlist_pk)
        songs = playlist.playlists.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)

    def create(self, request, playlist_pk=None):
        """
        Afegir una cançó existent (song_id) a la playlist
        """
        playlist = get_object_or_404(PlayList, pk=playlist_pk)
        serializer = AddSongToPlaylistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        song = get_object_or_404(Song, pk=serializer.validated_data["song_id"])
        song.playlists.add(playlist)
        song.save()

        return Response({"status": "added"}, status=status.HTTP_201_CREATED)
    
class UserProfileByUsernameView(APIView):
    def get(self, request, username):
        try:
            #Buscar el usuario por su nombre de usuario
            user = User.objects.get(username=username)

            # Obtener el perfil asociado al usuario
            profile = UserProfile.objects.get(user=user)

            # Serializar y devolver los datos del perfil
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except User.DoesNotExist or UserProfile.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
class UsernameSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')

        if not query:
            return Response({'error': 'Se requiere el parámetro "q".'}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(username__icontains=query)[:10]  # Limitado a 10 resultados
        usernames = [{'username': user.username} for user in users]

        return Response(usernames, status=status.HTTP_200_OK)
