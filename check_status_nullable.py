#!/usr/bin/env python3
import os, sys, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Horilux.settings.dev")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from properties.models import Property
from crm.models import Lead
from marketing.models import MarketingCampaign
from transactions.models import Transaction
from operations.models import Task

models = [Property, Lead, MarketingCampaign, Transaction, Task]

for m in models:
    field = m._meta.get_field("status")
    null_count = m.objects.filter(status__isnull=True).count()
    total = m.objects.count()
    print(f"{m.__name__:<20} null={field.null:<6} blank={field.blank:<6} rows_with_null_status={null_count}/{total}")
