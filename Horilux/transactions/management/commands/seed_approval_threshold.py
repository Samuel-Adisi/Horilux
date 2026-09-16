from django.core.management.base import BaseCommand
from transactions.models import ApprovalThreshold


class Command(BaseCommand):
    help = "Seed the ApprovalThreshold singleton with a starting value."

    def handle(self, *args, **options):
        threshold = ApprovalThreshold.get_solo()
        if threshold.ceo_approval_min_price == 0:
            threshold.ceo_approval_min_price = 500000
            threshold.save()
        self.stdout.write(self.style.SUCCESS(
            f"ApprovalThreshold: GHS {threshold.ceo_approval_min_price}"
        ))
