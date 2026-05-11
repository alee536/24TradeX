from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from .models import Notification
from .serializers import NotificationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    qs = Notification.objects.filter(user=request.user)
    unread_only = request.query_params.get('unread_only')
    if unread_only == 'true':
        qs = qs.filter(is_read=False)

    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()

    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = NotificationSerializer(page, many=True)
    response = paginator.get_paginated_response(serializer.data)
    response.data['unread_count'] = unread_count
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    try:
        notif = Notification.objects.get(pk=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    notif.is_read = True
    notif.save()
    return Response({'message': 'Marked as read'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})
