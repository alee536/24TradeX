from django.shortcuts import redirect
from functools import wraps


def admin_required(view_func):
    """Decorator to check if user is admin (staff or superuser)."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated or not (request.user.is_staff or request.user.is_superuser):
            return redirect('admin_dashboard:login')
        return view_func(request, *args, **kwargs)
    return wrapper
