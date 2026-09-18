"""Data migration: compute Property.completion_percent from each property's
VerificationChecklist (it was never computed before and is 0 everywhere)."""
from django.db import migrations

CHECK_FIELDS = (
    "owner_info_ok", "price_ok", "location_ok", "details_ok",
    "photos_ok", "documents_ok", "commission_agreement_ok",
)


def forwards(apps, schema_editor):
    VerificationChecklist = apps.get_model("properties", "VerificationChecklist")
    Property = apps.get_model("properties", "Property")
    for checklist in VerificationChecklist.objects.all().iterator():
        ticked = sum(1 for f in CHECK_FIELDS if getattr(checklist, f))
        percent = round(100 * ticked / len(CHECK_FIELDS))
        Property.objects.filter(pk=checklist.property_id).update(completion_percent=percent)


class Migration(migrations.Migration):

    dependencies = [
        ("properties", "0004_property_inquiries_count_property_published_at_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
