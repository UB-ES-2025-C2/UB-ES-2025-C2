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
            validated_data['password']
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
    playlists = PlayListSerializer(many=True, read_only=True)

    class Meta:
        model = Song
        fields = '__all__'



class AddSongToPlaylistSerializer(serializers.Serializer):
    song_id = serializers.IntegerField()

    def validate_song_id(self, value):
        if not Song.objects.filter(id=value).exists():
            raise serializers.ValidationError("Aquest song_id no existeix")
        return value
