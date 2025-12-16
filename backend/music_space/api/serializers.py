"""serializers.py"""

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import *


class UserSerializer(serializers.ModelSerializer):
    """Serializer per a l'usuari."""

    password_conf = serializers.CharField(max_length=50, write_only=True)
    password = serializers.CharField(max_length=50, write_only=True)

    class Meta:
        """Meta informació del serializer."""

        model = User
        fields = ['username', 'email', 'password', 'password_conf']

    def validate(  # noqa: PLR6301
        self, attrs: dict
    ) -> dict:
        """
        Valida que les contrasenyes coincideixin.

        Raises
        ------
        serializers.ValidationError
            Si les contrasenyes no coincideixen.

        Returns
        -------
        dict
            Els atributs validats.
        """
        if attrs['password'] != attrs['password_conf']:
            msg = "Passwords don't match"
            raise serializers.ValidationError(msg)
        return attrs

    def create(  # noqa: PLR6301
        self, validated_data: dict
    ) -> User:
        """
        Crea un nou usuari.

        Raises
        ------
        serializers.ValidationError
            Si l'username ja està en ús.

        Returns
        -------
        User
            L'usuari creat.
        """
        validated_data.pop('password_conf')
        if User.objects.filter(username=validated_data['username']).exists():
            msg = "Username already taken"
            raise serializers.ValidationError(msg)
        return User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password'],
        )


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer per al perfil d'usuari."""

    class Meta:
        """Meta informació del serializer."""

        model = UserProfile
        fields = '__all__'


class PlayListSerializer(serializers.ModelSerializer):
    """Serializer per a les playlists."""

    watched = UserProfileSerializer(many=True, read_only=True)
    owner = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        many=True,
        required=False,
        allow_empty=True,
    )

    class Meta:
        """Meta informació del serializer."""

        model = PlayList
        fields = '__all__'
        extra_kwargs = {'owner': {'required': False}}


class SongSerializer(serializers.ModelSerializer):
    """Serializer per a les cançons."""

    authors = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        many=True,
        required=False,
        allow_empty=True,
    )

    class Meta:
        """Meta informació del serializer."""

        model = Song
        fields = '__all__'


class PlayListSongSerializer(serializers.ModelSerializer):
    """Serializer per a la relació cançó-playlist."""

    song = SongSerializer(read_only=True)
    song_id = serializers.PrimaryKeyRelatedField(
        queryset=Song.objects.all(),
        source='song',
        write_only=True,
    )
    position = serializers.IntegerField(required=False)

    class Meta:
        """Meta informació del serializer."""

        model = PlaylistSong
        fields = ['id', 'song', 'song_id', 'position']


class FollowersSerializer(serializers.ModelSerializer):
    """Serializer per als seguidors d'un usuari."""

    follower = UserProfileSerializer(read_only=True)
    follower_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        source='follower',
        write_only=True,
    )

    class Meta:
        """Meta informació del serializer."""

        model = Follow
        fields = ['id', 'follower', 'follower_id', 'date_added']


class FollowingSerializer(serializers.ModelSerializer):
    """Serializer per als usuaris seguits per un usuari."""

    followed = UserProfileSerializer(read_only=True)
    followed_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        source='followed',
        write_only=True,
    )

    class Meta:
        """Meta informació del serializer."""

        model = Follow
        fields = ['id', 'followed', 'followed_id', 'date_added']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer per als comentaris de cançons."""

    user = UserProfileSerializer(read_only=True)
    song = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        """Meta informació del serializer."""

        model = Comment
        fields = ['id', 'song', 'user', 'content', 'created_at']
        read_only_fields = ['created_at', 'song', 'user']
