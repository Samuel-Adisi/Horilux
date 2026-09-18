from django.core.cache import cache
from django.db.models import Count, Sum, Prefetch, Avg
from django.utils import timezone

from properties.models import Property
from properties.models import PropertyMedia
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


def marketing_campaign_detail_report():
    """
    Company-wide campaign directory for the CEO Campaigns page.
    Read-only: CEO has view+export on marketing_campaign at company scope.
    """
    qs = MarketingCampaign.objects.select_related("property", "created_by").prefetch_related(
        Prefetch(
            "property__media",
            queryset=PropertyMedia.objects.order_by("order"),
            to_attr="prefetched_media",
        )
    ).all()

    by_status = dict(qs.values_list("status").annotate(c=Count("id")).order_by())
    status_counts = {
        "draft": by_status.get(MarketingCampaign.Status.DRAFT, 0),
        "in_review": by_status.get(MarketingCampaign.Status.IN_REVIEW, 0),
        "scheduled": by_status.get(MarketingCampaign.Status.SCHEDULED, 0),
        "published": by_status.get(MarketingCampaign.Status.PUBLISHED, 0),
    }

    totals = CampaignPerformance.objects.filter(campaign__in=qs).aggregate(
        views=Sum("views"), enquiries=Sum("enquiries"),
        leads_generated=Sum("leads_generated"),
        viewings_booked=Sum("viewings_booked"),
        conversions=Sum("conversions"),
    )
    totals = {k: v or 0 for k, v in totals.items()}

    campaigns = []
    for c in qs.order_by("-created_at"):
        perf = c.performance_records.aggregate(
            views=Sum("views"), enquiries=Sum("enquiries"),
            leads_generated=Sum("leads_generated"),
            viewings_booked=Sum("viewings_booked"),
            conversions=Sum("conversions"),
        )
        has_perf = any(v is not None for v in perf.values())
        prefetched_media = getattr(c.property, "prefetched_media", [])
        image_url = prefetched_media[0].file.url if prefetched_media else None
        campaigns.append({
            "id": str(c.id),
            "property_id": c.property_id,
            "property_title": str(c.property),
            "property_image_url": image_url,
            "status": c.status,
            "status_label": c.get_status_display(),
            "headline": (c.content or {}).get("headline", ""),
            "created_by_name": f"{c.created_by.first_name} {c.created_by.last_name}".strip() if c.created_by else "—",
            "created_at": c.created_at,
            "scheduled_date": c.scheduled_date,
            "published_date": c.published_date,
            "has_performance": has_perf,
            "performance": {k: (v or 0) for k, v in perf.items()},
        })

    return {
        "total_campaigns": sum(status_counts.values()),
        "status_counts": status_counts,
        "totals": totals,
        "campaigns": campaigns,
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


def staff_directory_report():
    """
    Real staff directory for the CEO Staff Directory page.
    Sources: accounts.models.User, Department, Role, UserRole.
    No invented fields -- name, email, phone, department, role, active
    status, and join date are the only fields that exist on the real model.
    """
    from accounts.models import User

    users = (
        User.objects.select_related("department")
        .prefetch_related("user_roles__role")
        .order_by("first_name", "last_name")
    )

    staff = []
    for user in users:
        role_names = [ur.role.name for ur in user.user_roles.all()]
        staff.append({
            "id": str(user.id),
            "name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "phone": user.phone,
            "department": user.department.get_name_display() if user.department else None,
            "roles": role_names,
            "is_active": user.is_active,
            "date_joined": user.date_joined.isoformat(),
        })

    return {
        "total_staff": len(staff),
        "active_count": sum(1 for s in staff if s["is_active"]),
        "staff": staff,
    }


def property_performance():
    from django.db.models import Count, Avg, Q
    from django.utils import timezone
    from properties.models import Property
    from viewings.models import Viewing
    from transactions.models import Transaction

    properties = Property.objects.all()
    now = timezone.now()

    total_properties = properties.count()
    total_views = sum(p.views_count for p in properties)
    total_inquiries = sum(p.inquiries_count for p in properties)

    viewing_counts = {
        v["property_id"]: v
        for v in Viewing.objects.values("property_id").annotate(
            total=Count("id"),
            hot=Count("id", filter=Q(outcome="hot")),
            warm=Count("id", filter=Q(outcome="warm")),
            cold=Count("id", filter=Q(outcome="cold")),
        )
    }

    closed_property_ids = set(
        Transaction.objects.filter(status="closed").values_list("property_id", flat=True)
    )

    region_avg_price = {
        r["region"]: r["avg_price"]
        for r in properties.values("region").annotate(avg_price=Avg("price"))
    }

    rows = []
    for p in properties:
        vc = viewing_counts.get(p.id, {"total": 0, "hot": 0, "warm": 0, "cold": 0})
        end_date = p.published_at if p.status in ["sold_rented", "archived"] and p.published_at else now
        days_on_market = max((end_date - p.created_at).days, 0)
        region_avg = region_avg_price.get(p.region)

        rows.append({
            "id": str(p.id),
            "title": getattr(p, "title", None) or f"{p.property_type} — {p.region}",
            "status": p.status,
            "region": p.region,
            "property_type": p.property_type,
            "price": float(p.price) if p.price is not None else None,
            "price_vs_region_avg_pct": (
                round(((float(p.price) - float(region_avg)) / float(region_avg)) * 100, 1)
                if p.price is not None and region_avg else None
            ),
            "days_on_market": days_on_market,
            "views_count": p.views_count,
            "inquiries_count": p.inquiries_count,
            "viewings_total": vc["total"],
            "viewings_hot": vc["hot"],
            "viewings_warm": vc["warm"],
            "viewings_cold": vc["cold"],
            "converted_to_transaction": p.id in closed_property_ids,
            "conversion_rate_pct": (
                round((1 if p.id in closed_property_ids else 0) / vc["total"] * 100, 1)
                if vc["total"] else None
            ),
        })

    status_funnel = {}
    for p in properties.values("status").annotate(count=Count("id")):
        status_funnel[p["status"]] = p["count"]

    top_performers = sorted(rows, key=lambda r: (r["views_count"], r["viewings_total"]), reverse=True)[:5]
    stale_listings = sorted(
        [r for r in rows if r["status"] in ["published", "marketing_ready", "under_offer"]],
        key=lambda r: (-r["days_on_market"], r["views_count"]),
    )[:5]

    return {
        "summary": {
            "total_properties": total_properties,
            "total_views": total_views,
            "total_inquiries": total_inquiries,
            "avg_days_on_market": (
                round(sum(r["days_on_market"] for r in rows) / len(rows), 1) if rows else 0
            ),
        },
        "status_funnel": status_funnel,
        "top_performers": top_performers,
        "stale_listings": stale_listings,
        "properties": rows,
    }


def recent_activity(limit=15):
    from audit.models import AuditLog

    logs = (
        AuditLog.objects
        .select_related("actor")
        .order_by("-timestamp")[:limit]
    )
    return [
        {
            "id": log.id,
            "actor": log.actor.get_full_name() if log.actor else "System",
            "action": log.action,
            "model": log.model_name,
            "object_id": log.object_id,
            "timestamp": log.timestamp.isoformat(),
        }
        for log in logs
    ]


def governance_actions():
    from django.utils import timezone
    from properties.models import Property
    from crm.models import Lead
    from viewings.models import Viewing

    today = timezone.now().date()
    items = []

    pending_approvals = Property.objects.filter(status="pending_verification")
    pending_count = pending_approvals.count()
    if pending_count:
        items.append({
            "id": "pending-approvals",
            "severity": "COMPLIANCE",
            "due": "Verification",
            "severity_color": "amber",
            "title": f"{pending_count} Propert{'y' if pending_count == 1 else 'ies'} Pending Verification",
            "detail": ", ".join(p.title or f"{p.property_type} — {p.region}" for p in pending_approvals[:3]),
            "cta": "Review Approvals",
            "cta_style": "solid",
            "link": "/ceo/approvals",
        })

    unassigned = Lead.objects.filter(assigned_agent__isnull=True)
    unassigned_count = unassigned.count()
    if unassigned_count:
        items.append({
            "id": "unassigned-leads",
            "severity": "CRM LAG",
            "due": "Unassigned",
            "severity_color": "amber",
            "title": f"{unassigned_count} Lead{'s' if unassigned_count != 1 else ''} Unassigned",
            "detail": f"{unassigned_count} lead{'s' if unassigned_count != 1 else ''} have no agent assigned and may be going cold.",
            "cta": "View Leads",
            "cta_style": "outline",
            "link": "/ceo/leads",
        })

    overdue = Viewing.objects.filter(status__in=["scheduled", "confirmed"], date__lt=today)
    overdue_count = overdue.count()
    if overdue_count:
        items.append({
            "id": "overdue-viewings",
            "severity": "OVERDUE",
            "due": f"{overdue_count} overdue",
            "severity_color": "rose",
            "title": f"{overdue_count} Overdue Viewing{'s' if overdue_count != 1 else ''}",
            "detail": "Scheduled viewings past their date with no completed/cancelled status update.",
            "cta": "Review Viewings",
            "cta_style": "outline",
            "link": "/ceo/viewings",
        })

    return items
