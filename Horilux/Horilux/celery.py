import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Horilux.settings.dev")

app = Celery("Horilux")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "sweep-overdue-followups": {
        "task": "viewings.tasks.sweep_overdue_followups",
        "schedule": crontab(minute="*/15"),
    },
}
app.conf.timezone = "UTC"


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
