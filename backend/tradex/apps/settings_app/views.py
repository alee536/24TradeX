from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import SystemSettings
from .serializers import SystemSettingsSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_settings(request):
    settings = SystemSettings.get_settings()
    return Response(SystemSettingsSerializer(settings).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_settings(request):
    settings_obj = SystemSettings.get_settings()
    serializer = SystemSettingsSerializer(settings_obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
