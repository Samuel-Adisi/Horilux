from datetime import date
from celery import shared_task

from viewings.models import FollowUp
from notifications.tasks import create_notification


@shared_task
def sweep_overdue_followups():
    overdue = FollowUp.objects.filter(
        completed=False,
        due_date__lt=date.today(),
    ).select_related("responsible_agent")

    notified = 0
    for follow_up in overdue:
        if follow_up.responsible_agent:
            create_notification(
                recipient=follow_up.responsible_agent,
                type_="followup.overdue",
                message=f"Follow-up overdue since {follow_up.due_date}.",
                related_obj=follow_up,
            )
            notified += 1
    return {"overdue_count": overdue.count(), "notified": notified}
