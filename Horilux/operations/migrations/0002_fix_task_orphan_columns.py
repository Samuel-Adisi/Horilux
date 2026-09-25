from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("operations", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "ALTER TABLE operations_task ALTER COLUMN note DROP NOT NULL;",
                "ALTER TABLE operations_task ALTER COLUMN priority DROP NOT NULL;",
            ],
            reverse_sql=[
                "ALTER TABLE operations_task ALTER COLUMN priority SET NOT NULL;",
                "ALTER TABLE operations_task ALTER COLUMN note SET NOT NULL;",
            ],
        ),
    ]
