import string
import random
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


def generate_sponsor_code():
    chars = string.ascii_uppercase + string.digits
    return '24TX-' + ''.join(random.choices(chars, k=6))


def generate_unique_user_id(model_cls):
    """Generate unique user ID in format 24TX-000123."""
    last_user = model_cls.objects.all().order_by('-id').first()
    next_number = (last_user.id + 1) if last_user else 1
    return f"24TX-{next_number:06d}"


class User(AbstractUser):
    username = models.CharField(max_length=150, unique=False)
    unique_id = models.CharField(max_length=20, unique=True, blank=True, db_index=True)
    date_joined = models.DateTimeField(default=timezone.now, verbose_name='date joined', db_index=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    sponsor_code = models.CharField(max_length=20, unique=True, blank=True)
    wallet_address = models.CharField(max_length=255, blank=True, null=True)
    is_banned = models.BooleanField(default=False)
    sponsor_earnings = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    sponsored_by = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='sponsored_users'
    )

    def save(self, *args, **kwargs):
        if not self.sponsor_code:
            code = generate_sponsor_code()
            while User.objects.filter(sponsor_code=code).exists():
                code = generate_sponsor_code()
            self.sponsor_code = code
        
        if not self.unique_id:
            unique_id = generate_unique_user_id(User)
            while User.objects.filter(unique_id=unique_id).exists():
                next_number = int(unique_id.split('-')[1]) + 1
                unique_id = f"24TX-{next_number:06d}"
            self.unique_id = unique_id
        
        super().save(*args, **kwargs)

    @property
    def sponsor_link(self):
        from django.conf import settings
        return f"{settings.SITE_URL}/register?sp={self.sponsor_code}"

    @property
    def sponsored_users_count(self):
        """Count direct sponsored users"""
        return self.sponsored_users.count()
    
    @property
    def total_sponsored_count(self):
        """Count all sponsored users recursively (includes nested)"""
        count = self.sponsored_users.count()
        for child in self.sponsored_users.all():
            count += child.total_sponsored_count
        return count

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        indexes = [
            models.Index(fields=['sponsored_by', 'date_joined'], name='accounts_us_sponsor_f4948b_idx'),
        ]
