from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt import authentication
from rest_framework.views import APIView

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
            # Obtener el perfil asociado al usuario
            profile = UserProfile.objects.get(nickname=username)

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


        users = UserProfile.objects.filter(nickname__icontains=query)[:10]  # Limitado a 10 resultados
        nickname = [{'username': user.nickname} for user in users]

        return Response(nickname, status=status.HTTP_200_OK)
    
class SongByNameView(APIView):
    def get(self, request, name):
        try:
            # Obtener la canción por título
            song = Song.objects.get(name=name)

            # Serializar y devolver los datos de la canción
            serializer = SongSerializer(song)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Song.DoesNotExist:
            return Response({'error': 'Canción no encontrada'}, status=status.HTTP_404_NOT_FOUND)

class SongNameSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')

        if not query:
            return Response({'error': 'Se requiere el parámetro "q".'}, status=status.HTTP_400_BAD_REQUEST)

        songs = Song.objects.filter(name__icontains=query)[:10]  # Limitado a 10 resultados
        names = [{'name': song.name} for song in songs]

        return Response(names, status=status.HTTP_200_OK)
