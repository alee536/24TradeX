import jwt
import datetime
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer


def generate_token(user):
    payload = {
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=settings.JWT_EXPIRY_HOURS),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok'})


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    token = generate_token(user)
    return Response({
        'token': token,
        'user': UserProfileSerializer(user).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    try:
        user_obj = User.objects.get(email=username)
        username = user_obj.username
    except User.DoesNotExist:
        pass

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if user.is_banned:
        return Response({'error': 'Account is banned'}, status=status.HTTP_403_FORBIDDEN)

    token = generate_token(user)
    return Response({
        'token': token,
        'user': UserProfileSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    return Response({'message': 'Logged out successfully'})


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        return Response(UserProfileSerializer(request.user).data)

    serializer_data = {}
    if 'full_name' in request.data:
        serializer_data['full_name'] = request.data['full_name']
    if 'wallet_address' in request.data:
        serializer_data['wallet_address'] = request.data['wallet_address']

    for key, value in serializer_data.items():
        setattr(request.user, key, value)
    request.user.save()

    return Response(UserProfileSerializer(request.user).data)
