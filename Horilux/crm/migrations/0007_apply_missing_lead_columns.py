from django.db import migrations


def apply_missing(apps, schema_editor):
    conn = schema_editor.connection
    existing_tables = conn.introspection.table_names()
    Lead = apps.get_model("crm", "Lead")
    AgentQuota = apps.get_model("crm", "AgentQuota")

    with conn.cursor() as cur:
        lead_cols = {c.name for c in conn.introspection.get_table_description(cur, Lead._meta.db_table)}

    for name in ("lost_reason", "referred_by"):
        field = Lead._meta.get_field(name)
        if field.column not in lead_cols:
            schema_editor.add_field(Lead, field)

    if AgentQuota._meta.db_table not in existing_tables:
        schema_editor.create_model(AgentQuota)


class Migration(migrations.Migration):

    dependencies = [("crm", "0006_lead_property_interest")]

    operations = [migrations.RunPython(apply_missing, migrations.RunPython.noop)]
