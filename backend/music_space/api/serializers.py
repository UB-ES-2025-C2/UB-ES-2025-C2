from django.contrib.auth.models import User
from rest_framework import serializers

from .models import *


class UserSerializer(serializers.ModelSerializer):
    password_conf = serializers.CharField(max_length=50, write_only=True)
    password = serializers.CharField(max_length=50, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', "password", "password_conf"]

    def create(self, validated_data):
        if validated_data['password'] != validated_data['password_conf']:
            raise serializers.ValidationError("Passwords don't match")

        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError("Username already taken")

        return User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password'],
        )


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'


class PlayListSerializer(serializers.ModelSerializer):
    watched = UserProfileSerializer(many=True, read_only=True)

    class Meta:
        model = PlayList
        fields = '__all__'


class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = '__all__'


class PlayListSongSerializer(serializers.ModelSerializer):
    song = SongSerializer(read_only=True)
    song_id = serializers.PrimaryKeyRelatedField(
        queryset=Song.objects.all(),
        source='song',
        write_only=True
    )
    position = serializers.IntegerField(required=False)

    class Meta:
        model = PlaylistSong
        fields = ['id', 'song', 'song_id', 'position']


class FollowersSerializer(serializers.ModelSerializer):
    follower = UserProfileSerializer(read_only=True)
    follower_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        source='follower',
        write_only=True
    )

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'follower_id', 'date_added']


class FollowingSerializer(serializers.ModelSerializer):
    followed = UserProfileSerializer(read_only=True)
    followed_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        source='followed',
        write_only=True
    )

    class Meta:
        model = Follow
        fields = ['id', 'followed', 'followed_id', 'date_added']

