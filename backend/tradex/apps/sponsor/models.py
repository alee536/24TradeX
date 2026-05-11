from django.db import models
from django.conf import settings


class SponsorEarning(models.Model):
    sponsor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sponsor_earnings_records'
    )
    sponsored_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='generated_sponsor_earnings'
    )
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    source_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sponsor.username} earned {self.amount} from {self.sponsored_user.username}"
