from django.core.cache import cache
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
    by_status = dict(qs.values_list("status").annotate(c=Count("id")).order_by())
    return {
        "total_properties": sum(by_status.values()),
        "by_status": by_status,
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
    leads_by_status = dict(lead_qs.values_list("status").annotate(c=Count("id")).order_by())
    return {
        "total_leads": sum(leads_by_status.values()),
        "leads_by_status": leads_by_status,
        "total_clients": client_qs.count(),
        "overdue_followups": FollowUp.objects.filter(**followup_filter).count(),
    }


def marketing_report(user=None):
    qs = MarketingCampaign.objects.all()
    if user is not None:
        qs = qs.filter(created_by=user)
    by_status = dict(qs.values_list("status").annotate(c=Count("id")).order_by())
    perf = CampaignPerformance.objects.filter(campaign__in=qs).aggregate(
        views=Sum("views"), enquiries=Sum("enquiries"),
        leads_generated=Sum("leads_generated"),
        viewings_booked=Sum("viewings_booked"),
        conversions=Sum("conversions"),
    )
    return {
        "total_campaigns": sum(by_status.values()),
        "by_status": by_status,
        "performance": {k: v or 0 for k, v in perf.items()},
    }


def finance_report(user=None):
    txn_qs = Transaction.objects.all()
    by_status = dict(txn_qs.values_list("status").annotate(c=Count("id")).order_by())
    commission_totals = Commission.objects.filter(transaction__in=txn_qs).aggregate(
        expected=Sum("expected"), received=Sum("received"), outstanding=Sum("outstanding"),
        agent_share=Sum("agent_share"), company_share=Sum("company_share"),
    )
    return {
        "total_transactions": sum(by_status.values()),
        "by_status": by_status,
        "commission": {k: v or 0 for k, v in commission_totals.items()},
    }


def operations_report(user=None):
    from operations.models import Task
    qs = Task.objects.all()
    by_status = dict(qs.values_list("status").annotate(c=Count("id")).order_by())
    return {
        "total_tasks": sum(by_status.values()),
        "by_status": by_status,
        "overdue_tasks": qs.filter(
            due_date__lt=timezone.now().date()
        ).exclude(status=Task.Status.DONE).count(),
    }




def _month_label(dt):
    return dt.strftime("%b")


def ceo_kpis():
    from django.db.models.functions import TruncMonth
    from accounts.models import User

    now = timezone.now()
    year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

    txn_qs = Transaction.objects.filter(created_at__gte=year_start)
    agg = txn_qs.aggregate(
        gross_volume=Sum("price"),
        avg_deal_size=Avg("price"),
    )

    active_agents = User.objects.filter(is_active=True, department__isnull=False).count()

    total_leads = Lead.objects.count()
    closed_transactions = Transaction.objects.filter(status=Transaction.Status.CLOSED).count()
    closed_yield = (closed_transactions / total_leads * 100) if total_leads else 0

    active_mandates = Property.objects.exclude(
        status__in=[Property.Status.SOLD_RENTED, Property.Status.ARCHIVED]
    ).count()

    return {
        "gross_volume_ytd": agg["gross_volume"] or 0,
        "avg_deal_size": agg["avg_deal_size"] or 0,
        "active_agents": active_agents,
        "active_mandates": active_mandates,
        "closed_yield_percent": round(closed_yield, 1),
    }


def revenue_trend(months=6):
    from django.db.models.functions import TruncMonth
    from dateutil.relativedelta import relativedelta

    now = timezone.now()
    start = (now.replace(day=1) - relativedelta(months=months - 1))
    prior_start = start - relativedelta(years=1)
    prior_end = now - relativedelta(years=1)

    current = (
        Transaction.objects.filter(created_at__gte=start)
        .annotate(m=TruncMonth("created_at"))
        .values("m")
        .annotate(total=Sum("price"))
        .order_by("m")
    )
    prior = (
        Transaction.objects.filter(created_at__gte=prior_start, created_at__lte=prior_end)
        .annotate(m=TruncMonth("created_at"))
        .values("m")
        .annotate(total=Sum("price"))
        .order_by("m")
    )
    prior_by_month = {p["m"].month: p["total"] or 0 for p in prior}

    return [
        {
            "month": _month_label(row["m"]),
            "current": float(row["total"] or 0),
            "prior": float(prior_by_month.get(row["m"].month, 0)),
        }
        for row in current
    ]


def conversion_funnel():
    order = [
        Lead.Status.NEW, Lead.Status.CONTACTED, Lead.Status.QUALIFIED,
        Lead.Status.PROPERTY_MATCHED, Lead.Status.VIEWING,
        Lead.Status.NEGOTIATION, Lead.Status.CLOSED,
    ]
    counts = dict(Lead.objects.values_list("status").annotate(c=Count("id")).order_by())
    total = Lead.objects.count() or 1
    stages = []
    for status in order:
        c = counts.get(status, 0)
        stages.append({
            "label": Lead.Status(status).label,
            "count": c,
            "pct": round(c / total * 100, 1),
        })
    return stages


def department_performance():
    rows = (
        Transaction.objects.exclude(agent__department__isnull=True)
        .values("agent__department__name")
        .annotate(total=Sum("price"), count=Count("id"))
        .order_by("-total")
    )
    grand_total = sum(r["total"] or 0 for r in rows)
    if not grand_total:
        return []
    return [
        {
            "name": r["agent__department__name"],
            "value": float(r["total"] or 0),
            "count": r["count"],
            "pct": round(float(r["total"] or 0) / float(grand_total) * 100, 1),
        }
        for r in rows
    ]


def agent_leaderboard(limit=5):
    # limit=5 is an intentional design choice: the dashboard card shows a
    # top-5 snapshot, not a full roster. A "view all agents" page would need
    # its own paginated endpoint -- not built yet, tracked as a future item.
    rows = (
        Transaction.objects.filter(status=Transaction.Status.CLOSED)
        .exclude(agent__isnull=True)
        .values("agent__id", "agent__first_name", "agent__last_name", "agent__department__name")
        .annotate(deals=Count("id"), volume=Sum("price"))
        .order_by("-volume")[:limit]
    )
    agent_ids = [r["agent__id"] for r in rows]
    leads_by_agent = dict(
        Lead.objects.filter(assigned_agent_id__in=agent_ids)
        .values_list("assigned_agent_id")
        .annotate(c=Count("id"))
        .order_by()
    )
    result = []
    for i, r in enumerate(rows, start=1):
        agent_leads = leads_by_agent.get(r["agent__id"], 0)
        yield_pct = (r["deals"] / agent_leads * 100) if agent_leads else 0
        result.append({
            "rank": i,
            "name": f"{r['agent__first_name']} {r['agent__last_name']}",
            "division": r["agent__department__name"] or "—",
            "deals": r["deals"],
            "volume": float(r["volume"] or 0),
            "yield_percent": round(yield_pct, 1),
        })
    return result


def agents_roster_report():
    """
    Real per-agent performance roster for the CEO Agents Roster page.
    Extends agent_leaderboard() beyond its intentional top-5 limit -- this
    is the "own paginated endpoint" flagged as a future item in that
    function's comment. Every active, department-assigned user is included,
    not just top performers, so the CEO can see the full team.
    """
    from accounts.models import User

    agents = User.objects.filter(is_active=True, department__isnull=False).exclude(
        department__name="ceo"
    ).select_related("department")

    closed_by_agent = dict(
        Transaction.objects.filter(status=Transaction.Status.CLOSED)
        .exclude(agent__isnull=True)
        .values_list("agent_id")
        .annotate(c=Count("id"))
        .order_by()
    )
    volume_by_agent = dict(
        Transaction.objects.filter(status=Transaction.Status.CLOSED)
        .exclude(agent__isnull=True)
        .values_list("agent_id")
        .annotate(v=Sum("price"))
        .order_by()
    )
    active_deals_by_agent = dict(
        Transaction.objects.exclude(status=Transaction.Status.CLOSED)
        .exclude(agent__isnull=True)
        .values_list("agent_id")
        .annotate(c=Count("id"))
        .order_by()
    )
    leads_by_agent = dict(
        Lead.objects.exclude(assigned_agent__isnull=True)
        .values_list("assigned_agent_id")
        .annotate(c=Count("id"))
        .order_by()
    )

    roster = []
    for agent in agents:
        deals_closed = closed_by_agent.get(agent.id, 0)
        volume = float(volume_by_agent.get(agent.id, 0) or 0)
        active_deals = active_deals_by_agent.get(agent.id, 0)
        leads_assigned = leads_by_agent.get(agent.id, 0)
        conversion_pct = round(deals_closed / leads_assigned * 100, 1) if leads_assigned else 0
        roster.append({
            "id": str(agent.id),
            "name": f"{agent.first_name} {agent.last_name}".strip() or agent.email,
            "email": agent.email,
            "department": agent.department.get_name_display() if agent.department else "—",
            "date_joined": agent.date_joined.isoformat(),
            "deals_closed": deals_closed,
            "volume": volume,
            "active_deals": active_deals,
            "leads_assigned": leads_assigned,
            "conversion_percent": conversion_pct,
        })

    roster.sort(key=lambda a: a["volume"], reverse=True)

    return {
        "agents": roster,
        "total_agents": len(roster),
    }


def finance_detail_report(months=6):
    """
    Real revenue/commission detail for the CEO Revenue page.
    Everything here comes from Transaction/Commission -- no invented fields.
    """
    from django.db.models.functions import TruncMonth
    from dateutil.relativedelta import relativedelta

    now = timezone.now()
    year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    month_start = (now.replace(day=1) - relativedelta(months=months - 1))

    ytd_txns = Transaction.objects.filter(created_at__gte=year_start)
    gross_volume_ytd = ytd_txns.aggregate(total=Sum("price"))["total"] or 0
    txn_count_ytd = ytd_txns.count()

    commission_agg = Commission.objects.filter(transaction__created_at__gte=year_start).aggregate(
        received=Sum("received"),
        outstanding=Sum("outstanding"),
        agent_share=Sum("agent_share"),
        company_share=Sum("company_share"),
    )
    net_commission_income = commission_agg["received"] or 0
    outstanding_commission = commission_agg["outstanding"] or 0
    agent_payouts = commission_agg["agent_share"] or 0
    company_retention = commission_agg["company_share"] or 0
    effective_commission_pct = (
        round(float(net_commission_income) / float(gross_volume_ytd) * 100, 2)
        if gross_volume_ytd else 0
    )
    agent_payout_pct = (
        round(float(agent_payouts) / float(net_commission_income) * 100, 1)
        if net_commission_income else 0
    )

    monthly_txns = (
        Transaction.objects.filter(created_at__gte=month_start)
        .annotate(m=TruncMonth("created_at"))
        .values("m")
        .annotate(gross_volume=Sum("price"))
        .order_by("m")
    )
    monthly_commission = (
        Commission.objects.filter(transaction__created_at__gte=month_start)
        .annotate(m=TruncMonth("transaction__created_at"))
        .values("m")
        .annotate(
            commission_income=Sum("received"),
            agent_payouts=Sum("agent_share"),
            company_retention=Sum("company_share"),
        )
        .order_by("m")
    )
    commission_by_month = {row["m"]: row for row in monthly_commission}

    ledger = []
    for row in monthly_txns:
        c = commission_by_month.get(row["m"], {})
        ledger.append({
            "month": row["m"].strftime("%B %Y"),
            "gross_volume": float(row["gross_volume"] or 0),
            "commission_income": float(c.get("commission_income") or 0),
            "agent_payouts": float(c.get("agent_payouts") or 0),
            "company_retention": float(c.get("company_retention") or 0),
        })
    ledger.reverse()  # most recent month first

    return {
        "gross_volume_ytd": float(gross_volume_ytd),
        "transaction_count_ytd": txn_count_ytd,
        "net_commission_income": float(net_commission_income),
        "effective_commission_percent": effective_commission_pct,
        "outstanding_commission": float(outstanding_commission),
        "agent_payouts": float(agent_payouts),
        "agent_payout_percent": agent_payout_pct,
        "company_retention": float(company_retention),
        "monthly_ledger": ledger,
    }


def sales_pipeline_report():
    """
    Real sales pipeline for the CEO Sales Pipeline page.
    Stage cards use the actual Lead.Status choices -- no invented stage names.
    "Deals in flight" uses real Transaction rows not yet closed.
    """
    from crm.models import Lead

    stage_order = [
        Lead.Status.NEW,
        Lead.Status.CONTACTED,
        Lead.Status.QUALIFIED,
        Lead.Status.PROPERTY_MATCHED,
        Lead.Status.VIEWING,
        Lead.Status.NEGOTIATION,
        Lead.Status.CLOSED,
    ]
    counts = dict(Lead.objects.values_list("status").annotate(c=Count("id")).order_by())
    values = dict(
        Lead.objects.values_list("status")
        .annotate(v=Sum("budget"))
        .order_by()
    )

    stages = [
        {
            "status": status.value,
            "label": Lead.Status(status).label,
            "deal_count": counts.get(status, 0),
            "value": float(values.get(status, 0) or 0),
        }
        for status in stage_order
    ]

    in_flight = (
        Transaction.objects.exclude(status=Transaction.Status.CLOSED)
        .select_related("property", "client", "agent")
        .order_by("-price")[:10]
    )
    deals_in_flight = [
        {
            "id": str(t.id),
            "property_title": t.property.title if t.property_id else "—",
            "client_name": t.client.name if t.client_id else "—",
            "agent_name": f"{t.agent.first_name} {t.agent.last_name}" if t.agent_id else "Unassigned",
            "price": float(t.price),
            "status": t.status,
            "status_label": Transaction.Status(t.status).label,
        }
        for t in in_flight
    ]

    lost_count = counts.get(Lead.Status.LOST, 0)

    return {
        "stages": stages,
        "deals_in_flight": deals_in_flight,
        "lost_count": lost_count,
        "total_leads": sum(counts.values()),
    }


CEO_DASHBOARD_CACHE_KEY = "ceo_dashboard_v1"
CEO_DASHBOARD_CACHE_TTL = 120  # seconds


def ceo_dashboard():
    cached = cache.get(CEO_DASHBOARD_CACHE_KEY)
    if cached is not None:
        return cached

    data = {
        "listing": listing_report(),
        "sales": sales_report(),
        "marketing": marketing_report(),
        "finance": finance_report(),
        "operations": operations_report(),
        "kpis": ceo_kpis(),
        "revenue_trend": revenue_trend(),
        "conversion_funnel": conversion_funnel(),
        "departments": department_performance(),
        "leaderboard": agent_leaderboard(),
    }
    cache.set(CEO_DASHBOARD_CACHE_KEY, data, CEO_DASHBOARD_CACHE_TTL)
    return data
