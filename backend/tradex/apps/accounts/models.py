import uuid
import string
import random
from django.contrib.auth.models import AbstractUser
from django.db import models


def generate_sponsor_code():
    chars = string.ascii_uppercase + string.digits
    return '24TX-' + ''.join(random.choices(chars, k=6))


class User(AbstractUser):
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
        super().save(*args, **kwargs)

    @property
    def sponsor_link(self):
        from django.conf import settings
        return f"{settings.SITE_URL}/register?sp={self.username}"

    def __str__(self):
        return self.username
