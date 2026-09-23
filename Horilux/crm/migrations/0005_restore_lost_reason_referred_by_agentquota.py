# State-only migration: these columns/table already exist in the live
# database (originally created by 0004_lead_lost_reason_lead_referred_by_agentquota,
# whose source file was later lost while models.py was reverted). This migration
# restores Django's internal state to match reality WITHOUT issuing any DDL —
# database_operations is intentionally empty.
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("crm", "0003_interaction"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="lead",
                    name="lost_reason",
                    field=models.CharField(blank=True, default="", max_length=30),
                ),
                migrations.AddField(
                    model_name="lead",
                    name="referred_by",
                    field=models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="referrals",
                        to="crm.lead",
                    ),
                ),
                migrations.CreateModel(
                    name="AgentQuota",
                    fields=[
                        (
                            "id",
                            models.UUIDField(
                                default=uuid.uuid4,
                                editable=False,
                                primary_key=True,
                                serialize=False,
                            ),
                        ),
                        ("period", models.CharField(max_length=20)),
                        ("target_amount", models.DecimalField(decimal_places=2, max_digits=14)),
                        ("created_at", models.DateTimeField(auto_now_add=True)),
                        (
                            "agent",
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="quotas",
                                to=settings.AUTH_USER_MODEL,
                            ),
                        ),
                    ],
                ),
            ],
            database_operations=[],
        ),
    ]
