from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_alter_user_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='date_joined',
            field=models.DateTimeField(db_index=True, default=django.utils.timezone.now, verbose_name='date joined'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['sponsored_by', 'date_joined'], name='accounts_us_sponsor_f4948b_idx'),
        ),
    ]
