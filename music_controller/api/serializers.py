from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        #automatically and Id field is included
        fields = ('id', 'code', 'host', 
            'guest_can_pause', 'votes_to_skip', 'created_at')