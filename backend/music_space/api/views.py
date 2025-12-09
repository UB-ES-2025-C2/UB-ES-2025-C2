from django.shortcuts import get_object_or_404
from rest_framework import filters, permissions, status, viewsets
from rest_framework.authentication import BasicAuthentication, \
    SessionAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.exceptions import ValidationError, MethodNotAllowed
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import Token

from .serializers import *  # noqa: F403


class UserViewSet(viewsets.ModelViewSet):
    """This viewset automatically provides `list` and `retrieve` actions."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        raise MethodNotAllowed(self.request.method)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    def partial_update(self, request, *args, **kwargs):
        id = kwargs.get('pk')
        id_user = request.user.userprofile.id
        if id:
            id = int(id)
        if (id != id_user):
            raise ValidationError("No pots modificar el perfil d'un altre usuari")
        return  super().partial_update(request, *args, **kwargs)



class SongViewSet(viewsets.ModelViewSet):
    serializer_class = SongSerializer
    filter_backends = [filters.SearchFilter]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        name = self.request.query_params.get("name")
        topic = self.request.query_params.get("topic")
        artist = self.request.query_params.get("artist")
        exact_name = self.request.query_params.get("exact_name")
        qs = Song.songManager.filter_query(
            name=name, topic=topic, artist=artist, exact_name=exact_name
        )
        userprofile_pk = self.kwargs.get("userprofile_pk")
        if userprofile_pk:
            userprofile = get_object_or_404(UserProfile, id=userprofile_pk)
            qs = qs.filter(authors=userprofile)
        return qs
    def partial_update(self, request, *args, **kwargs):
        userprofile_pk = self.kwargs.get("userprofile_pk")
        if userprofile_pk:
            id = request.user.userprofile.id
            if int(userprofile_pk) != id:
                raise ValidationError("No pots modificar les cançons d'un altre usuari")
        return super().partial_update(request, *args, **kwargs)

    def perform_create(self, serializer):
        userprofile = get_object_or_404(UserProfile, user=self.request.user)
        song = serializer.save()
        authors_data = self.request.data.get("authors", [])
        song.authors.add(userprofile)
        if authors_data:
            for author_id in authors_data:
                author = get_object_or_404(UserProfile, id=author_id)
                song.authors.add(author)
        song.save()

class PlayListViewSet(viewsets.ModelViewSet):
    serializer_class = PlayListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get_queryset(self):
        name = self.request.query_params.get("name")
        topic = self.request.query_params.get("topic")
        exact_name = self.request.query_params.get("exact_name")
        qs = PlayList.playListManager.filter_query(
            name=name, topic=topic, exact_name=exact_name
        )
        userprofile_pk = self.kwargs.get("userprofile_pk")
        if userprofile_pk:
            userprofile = get_object_or_404(UserProfile, id=userprofile_pk)
            qs = qs.filter(owner=userprofile)
        return qs

    def perform_create(self, serializer):
        userprofile = get_object_or_404(UserProfile, user=self.request.user)
        playlist = serializer.save()
        owners_data = self.request.data.get("owner", [])
        playlist.owner.add(userprofile)
        if owners_data:
            for owner_id in owners_data:
                owner =  get_object_or_404(UserProfile,id=owner_id)
                playlist.owner.add(owner)
        playlist.save()

class PlaylistSongViewSet(viewsets.ModelViewSet):
    serializer_class = PlayListSongSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        playlist_pk = self.kwargs.get("playlist_pk")
        return PlaylistSong.objects.filter(playlist__id=playlist_pk)

    def perform_create(self, serializer):
        playlist_pk = self.kwargs.get("playlist_pk")
        playlist = get_object_or_404(PlayList, pk=playlist_pk)
        userprofile = get_object_or_404(UserProfile, user=self.request.user)
        if userprofile not in playlist.owner.all():
            raise ValidationError("No ets el propietari d'aquesta playlist.")
        song = serializer.validated_data['song']
        if PlaylistSong.objects.filter(playlist=playlist, song=song).exists():
            raise ValidationError("Aquesta cançó ja existeix a la playlist.")
        pos = playlist.songs.count() + 1 #augmentem en 1 la posició
        serializer.save(playlist=playlist, song=song, position=pos)

    def perform_destroy(self, instance):
        playlist = instance.playlist
        userprofile = get_object_or_404(UserProfile, user=self.request.user)
        if userprofile not in playlist.owner.all():
            raise ValidationError("No ets el propietari d'aquesta playlist.")
        position_deleted = instance.position
        instance.delete()
        # Reordenar posicions restants
        remaining = PlaylistSong.objects.filter(playlist=playlist, position__gt=position_deleted)
        for ps in remaining:
            ps.position -= 1
            ps.save()


class FollowersViewSet(viewsets.ModelViewSet):
    serializer_class = FollowersSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        userprofile_pk = self.kwargs.get("userprofile_pk")
        return Follow.objects.filter(followed__id=userprofile_pk)

    def perform_create(self, serializer):
        userprofile_pk = self.kwargs.get("userprofile_pk")
        followed = UserProfile.objects.get(pk=userprofile_pk)
        follower = serializer.validated_data.get("follower")
        if not follower:
            raise ValidationError({"detail": "Has d'indicar un follower vàlid."})

        if follower.id == followed.id:
            raise ValidationError({"detail": "Un usuari no es pot seguir a si mateix."})

        if Follow.objects.filter(follower=follower, followed=followed).exists():
            raise ValidationError({"detail": "Ja segueixes aquest usuari."})

        serializer.save(follower=follower, followed_id=userprofile_pk)


class FollowingViewSet(viewsets.ModelViewSet):
    serializer_class = FollowingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        userprofile_pk = self.kwargs.get("userprofile_pk")
        return Follow.objects.filter(follower__id=userprofile_pk)

    def perform_create(self, serializer):
        userprofile_pk = self.kwargs.get("userprofile_pk")
        follower = get_object_or_404(UserProfile, id=userprofile_pk)

        followed = serializer.validated_data.get("followed")
        if not followed:
            raise ValidationError({"detail": "Has d'indicar un usuari vàlid a seguir."})

        if follower.id == followed.id:
            raise ValidationError({"detail": "Un usuari no es pot seguir a si mateix."})

        if Follow.objects.filter(follower=follower, followed=followed).exists():
            raise ValidationError({"detail": "Ja segueixes aquest usuari."})

        serializer.save(follower=follower, followed=followed)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        song_pk = self.kwargs.get("song_pk")
        return Comment.objects.filter(song__id=song_pk)

    def perform_create(self, serializer):
        song_pk = self.kwargs.get("song_pk")
        song = get_object_or_404(Song, pk=song_pk)
        userprofile = get_object_or_404(UserProfile, user=self.request.user)
        serializer.save(song=song, user=userprofile)


class UserProfileByUsernameView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get(self, request, username):
        try:
            # Obtener el perfil asociado al usuario
            profile = UserProfile.objects.get(nickname=username)

            # Serializar y devolver los datos del perfil
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except User.DoesNotExist or UserProfile.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND
            )


class UsernameSearchView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get(self, request):
        query = request.query_params.get('q', '')

        if not query:
            return Response(
                {'error': 'Se requiere el parámetro "q".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        users = UserProfile.objects.filter(nickname__icontains=query)[
            :10
        ]  # Limitado a 10 resultados
        nickname = [{'username': user.nickname,
                     "id": user.id,
                     "profilePic": request.build_absolute_uri(user.profilePic.url)
                     } for user in users]

        return Response(nickname, status=status.HTTP_200_OK)


class SongByNameView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get(self, request, name):
        try:
            # Obtener la canción por título
            song = Song.objects.get(name=name)

            # Serializar y devolver los datos de la canción
            serializer = SongSerializer(song)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Song.DoesNotExist:
            return Response(
                {'error': 'Canción no encontrada'}, status=status.HTTP_404_NOT_FOUND
            )


class SongNameSearchView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get(self, request):
        query = request.query_params.get('q', '')

        if not query:
            return Response(
                {'error': 'Se requiere el parámetro "q".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        songs = Song.objects.filter(name__icontains=query)[
            :10
        ]  # Limitado a 10 resultados
        names = [{'name': song.name} for song in songs]

        return Response(names, status=status.HTTP_200_OK)

class UserProfileByTokenView(APIView):
    def get(self, request):
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
