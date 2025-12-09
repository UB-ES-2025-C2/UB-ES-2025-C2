"""views.py"""

from django.shortcuts import get_object_or_404
from rest_framework import filters, permissions, status, viewsets
from rest_framework.exceptions import MethodNotAllowed, ValidationError
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import *


class UserViewSet(viewsets.ModelViewSet):
    """Viewset automatically provides `list` and `retrieve` actions."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']
    authentication_classes = []

    def get_permissions(self) -> list:
        """
        Allow non-authenticated users to create an account.

        Raises
        ------
        MethodNotAllowed
            If the request method is not allowed.

        Returns
        -------
            list: List of permission classes.
        """
        post_request = 'POST'
        if self.request.method == post_request:
            return [permissions.AllowAny()]
        raise MethodNotAllowed(self.request.method)


class UserProfileViewSet(viewsets.ModelViewSet):
    """Viewset automatically provides `list` and `retrieve` actions."""

    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def partial_update(
        self,
        request: Request,
        *args: Any,
        **kwargs: Any,
    ) -> Response:
        """
        Ensure that users can only update their own profile.

        Raises
        ------
        ValidationError
            If a user tries to update another user's profile.

        Returns
        -------
            Response: The response from the superclass method.
        """
        user_id = kwargs.get('pk')
        id_user = request.user.userprofile.id
        if user_id:
            user_id = int(user_id)
        if user_id != id_user:
            msg = "No pots modificar el perfil d'un altre usuari"
            raise ValidationError(msg)
        return super().partial_update(request, *args, **kwargs)


class SongViewSet(viewsets.ModelViewSet):
    """Viewset automatically provides `list` and `retrieve` actions."""

    serializer_class = SongSerializer
    filter_backends = [filters.SearchFilter]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self) -> QuerySet:
        """
        Retrieve songs based on query parameters and user profile.

        Returns
        -------
            QuerySet: Filtered queryset of songs.
        """
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

    def partial_update(
        self,
        request: Request,
        *args: Any,
        **kwargs: Any,
    ) -> Response:
        """
        Ensure that users can only update their own songs.

        Raises
        ------
        ValidationError
            If a user tries to update another user's song.

        Returns
        -------
            Response: The response from the superclass method.
        """
        userprofile_pk = self.kwargs.get("userprofile_pk")
        if userprofile_pk:
            user_id = request.user.userprofile.id
            if int(userprofile_pk) != user_id:
                msg = "No pots modificar les cançons d'un altre usuari"
                raise ValidationError(msg)
        return super().partial_update(request, *args, **kwargs)

    def perform_create(
        self,
        serializer: SongSerializer,
    ) -> None:
        """Assign authors to the song upon creation."""
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
    """Viewset automatically provides `list` and `retrieve` actions."""

    serializer_class = PlayListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self) -> QuerySet:
        """
        Retrieve playlists based on query parameters and user profile.

        Returns
        -------
            QuerySet: Filtered queryset of playlists.
        """
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

    def perform_create(
        self,
        serializer: PlayListSerializer,
    ) -> None:
        """Assign owners to the playlist upon creation."""
        userprofile = get_object_or_404(UserProfile, user=self.request.user)
        playlist = serializer.save()
        owners_data = self.request.data.get("owner", [])
        playlist.owner.add(userprofile)
        if owners_data:
            for owner_id in owners_data:
                owner = get_object_or_404(UserProfile, id=owner_id)
                playlist.owner.add(owner)
        playlist.save()


class PlaylistSongViewSet(viewsets.ModelViewSet):
    """Viewset automatically provides `list` and `retrieve` actions."""

    serializer_class = PlayListSongSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self) -> QuerySet:
        """
        Retrieve songs in a playlist based on the playlist primary key.

        Returns
        -------
            QuerySet: Filtered queryset of PlaylistSong.
        """
        playlist_pk = self.kwargs.get("playlist_pk")
        return PlaylistSong.objects.filter(playlist__id=playlist_pk)

    def perform_create(
        self,
        serializer: PlayListSongSerializer,
    ) -> None:
        """
        Add a song to a playlist with proper validations.

        Raises
        ------
        ValidationError
            If the user is not the owner of the playlist or if the song already exists in the
            playlist.
        """
        playlist_pk = self.kwargs.get("playlist_pk")
        playlist = get_object_or_404(PlayList, pk=playlist_pk)
        userprofile = get_object_or_404(UserProfile, user=self.request.user)
        if userprofile not in playlist.owner.all():
            msg = "No ets el propietari d'aquesta playlist."
            raise ValidationError(msg)
        song = serializer.validated_data['song']
        if PlaylistSong.objects.filter(playlist=playlist, song=song).exists():
            msg = "Aquesta cançó ja existeix a la playlist."
            raise ValidationError(msg)
        pos = playlist.songs.count() + 1  # augmentem en 1 la posició
        serializer.save(playlist=playlist, song=song, position=pos)

    def perform_destroy(
        self,
        instance: PlaylistSong,
    ) -> None:
        """
        Remove a song from a playlist and reorder remaining songs.

        Raises
        ------
        ValidationError
            If the user is not the owner of the playlist.
        """
        playlist = instance.playlist
        userprofile = get_object_or_404(UserProfile, user=self.request.user)
        if (
            userprofile not in playlist.owner.all()
        ):  # usem token per comprovar propietari
            msg = "No ets el propietari d'aquesta playlist."
            raise ValidationError(msg)
        position_deleted = instance.position
        instance.delete()
        remaining = PlaylistSong.objects.filter(playlist=playlist, position__gt=position_deleted)
        for ps in remaining:
            ps.position -= 1
            ps.save()


class FollowersViewSet(viewsets.ModelViewSet):
    """Viewset automatically provides `list` and `retrieve` actions."""

    serializer_class = FollowersSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self) -> QuerySet:
        """
        Retrieve followers of a user profile.

        Returns
        -------
            QuerySet: Filtered queryset of followers.
        """
        userprofile_pk = self.kwargs.get("userprofile_pk")
        return Follow.objects.filter(followed__id=userprofile_pk)

    def perform_create(
        self,
        serializer: FollowersSerializer,
    ) -> None:
        """
        Add a follower to a user profile with proper validations.

        Raises
        ------
        ValidationError
            If the follower is invalid, tries to follow themselves, or already follows the user.
        """
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
    """Viewset automatically provides `list` and `retrieve` actions."""

    serializer_class = FollowingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self) -> QuerySet:
        """
        Retrieve users followed by a user profile.

        Returns
        -------
            QuerySet: Filtered queryset of following users.
        """
        userprofile_pk = self.kwargs.get("userprofile_pk")
        return Follow.objects.filter(follower__id=userprofile_pk)

    def perform_create(
        self,
        serializer: FollowingSerializer,
    ) -> None:
        """
        Add a followed user to a user profile with proper validations.

        Raises
        ------
        ValidationError
            If the followed user is invalid, tries to follow themselves, or already follows the user
        """
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
    """Viewset automatically provides `list` and `retrieve` actions."""

    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self) -> QuerySet:
        """
        Retrieve comments for a specific song.

        Returns
        -------
            QuerySet: Filtered queryset of comments.
        """
        song_pk = self.kwargs.get("song_pk")
        return Comment.objects.filter(song__id=song_pk)

    def perform_create(
        self,
        serializer: CommentSerializer,
    ) -> None:
        """Assign song and user to the comment upon creation."""
        song_pk = self.kwargs.get("song_pk")
        song = get_object_or_404(Song, pk=song_pk)
        userprofile = get_object_or_404(UserProfile, user=self.request.user)
        serializer.save(song=song, user=userprofile)


class UserProfileByUsernameView(APIView):
    """View to retrieve user profile by username."""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(  # noqa: PLR6301
        self,
        request: Request,  # noqa: ARG002
        username: str,
    ) -> Response:
        """
        Retrieve user profile by username.

        Parameters
        ----------
        request : Request
            The incoming request object.
        username : str
            The username of the user profile to retrieve.

        Returns
        -------
        Response
            The response containing the user profile data or an error message.
        """
        try:
            # Obtener el perfil asociado al usuario
            profile = UserProfile.objects.get(nickname=username)

            # Serializar y devolver los datos del perfil
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except (User.DoesNotExist, UserProfile.DoesNotExist):
            return Response(
                {'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND
            )


class UsernameSearchView(APIView):
    """View to search user profiles by username."""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(  # noqa: PLR6301
        self,
        request: Request,
    ) -> Response:
        """
        Search user profiles by username.

        Parameters
        ----------
        request : Request
            The incoming request object.

        Returns
        -------
        Response
            The response containing the list of matching usernames or an error message.
        """
        query = request.query_params.get('q', '')

        if not query:
            return Response(
                {'error': 'Se requiere el parámetro "q".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        users = UserProfile.objects.filter(nickname__icontains=query)[
            :10
        ]  # Limitado a 10 resultados
        nickname = [
            {
                'username': user.nickname,
                "id": user.id,
                "profilePic": request.build_absolute_uri(user.profilePic.url),
            }
            for user in users
        ]

        return Response(nickname, status=status.HTTP_200_OK)


class SongByNameView(APIView):
    """View to retrieve song by name."""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(  # noqa: PLR6301
        self,
        request: Request,  # noqa: ARG002
        name: str,
    ) -> Response:
        """
        Retrieve song by name.

        Parameters
        ----------
        request : Request
            The incoming request object.
        name : str
            The name of the song to retrieve.

        Returns
        -------
        Response
            The response containing the song data or an error message.
        """
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
    """View to search songs by name."""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(  # noqa: PLR6301
        self,
        request: Request,
    ) -> Response:
        """
        Search songs by name.

        Parameters
        ----------
        request : Request
            The incoming request object.

        Returns
        -------
        Response
            The response containing the list of matching song names or an error message.
        """
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
    """View to retrieve user profile by token."""

    def get(  # noqa: PLR6301
        self,
        request: Request,
    ) -> Response:
        """
        Retrieve user profile by token.

        Parameters
        ----------
        request : Request
            The incoming request object.

        Returns
        -------
        Response
            The response containing the user profile data or an error message.
        """
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
