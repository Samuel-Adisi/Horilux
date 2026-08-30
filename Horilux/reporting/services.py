from django.db.models import Count, Sum, Avg
from django.utils import timezone

from properties.models import Property
from crm.models import Lead, Client
from viewings.models import FollowUp
from transactions.models import Transaction, Commission
from marketing.models import MarketingCampaign, CampaignPerformance


def listing_report(user=None):
    qs = Property.objects.all()
    if user is not None and user.department_id:
        qs = qs.filter(agent__department_id=user.department_id)
    return {
        "total_properties": qs.count(),
        "by_status": dict(qs.values_list("status").annotate(c=Count("id")).order_by()),
        "avg_completion_percent": qs.aggregate(avg=Avg("completion_percent"))["avg"] or 0,
    }


def sales_report(user=None):
    lead_qs = Lead.objects.all()
    client_qs = Client.objects.all()
    followup_filter = {"completed": False, "due_date__lt": timezone.now().date()}
    if user is not None:
        lead_qs = lead_qs.filter(assigned_agent=user)
        client_qs = client_qs.filter(assigned_agent=user)
        followup_filter["responsible_agent"] = user
    return {
        "total_leads": lead_qs.count(),
        "leads_by_status": dict(lead_qs.values_list("status").annotate(c=Count("id")).order_by()),
        "total_clients": client_qs.count(),
        "overdue_followups": FollowUp.objects.filter(**followup_filter).count(),
    }


def marketing_report(user=None):
    qs = MarketingCampaign.objects.all()
    if user is not None:
        qs = qs.filter(created_by=user)
    perf = CampaignPerformance.objects.filter(campaign__in=qs).aggregate(
        views=Sum("views"), enquiries=Sum("enquiries"),
        leads_generated=Sum("leads_generated"),
        viewings_booked=Sum("viewings_booked"),
        conversions=Sum("conversions"),
    )
    return {
        "total_campaigns": qs.count(),
        "by_status": dict(qs.values_list("status").annotate(c=Count("id")).order_by()),
        "performance": {k: v or 0 for k, v in perf.items()},
    }


def finance_report(user=None):
    txn_qs = Transaction.objects.all()
    commission_totals = Commission.objects.filter(transaction__in=txn_qs).aggregate(
        expected=Sum("expected"), received=Sum("received"), outstanding=Sum("outstanding"),
        agent_share=Sum("agent_share"), company_share=Sum("company_share"),
    )
    return {
        "total_transactions": txn_qs.count(),
        "by_status": dict(txn_qs.values_list("status").annotate(c=Count("id")).order_by()),
        "commission": {k: v or 0 for k, v in commission_totals.items()},
    }


def operations_report(user=None):
    from operations.models import Task
    qs = Task.objects.all()
    return {
        "total_tasks": qs.count(),
        "by_status": dict(qs.values_list("status").annotate(c=Count("id")).order_by()),
        "overdue_tasks": qs.filter(
            due_date__lt=timezone.now().date()
        ).exclude(status=Task.Status.DONE).count(),
    }


def ceo_dashboard():
    return {
        "listing": listing_report(),
        "sales": sales_report(),
        "marketing": marketing_report(),
        "finance": finance_report(),
        "operations": operations_report(),
    }
