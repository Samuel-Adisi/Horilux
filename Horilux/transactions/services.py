"""
Commission calculation service.

Resolves the applicable CommissionRule for a transaction's closing agent
(role-specific rule -> default rule) and computes the agent/company split.
"""
from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ObjectDoesNotExist

from .models import Commission, CommissionRule, Transaction


class NoCommissionRuleError(Exception):
    """Raised when neither a role-specific nor a default CommissionRule exists."""


def resolve_commission_rule(agent) -> CommissionRule:
    """
    Look up the active CommissionRule for `agent`'s role(s) (users can hold
    multiple roles via UserRole). If more than one role-specific rule
    applies, the highest agent_split_percent wins (most favorable to agent,
    avoids ambiguity). Falls back to the default (role=None) rule if no
    role-specific rule is defined. Raises NoCommissionRuleError if nothing
    is configured at all.
    """
    role_ids = agent.user_roles.values_list("role_id", flat=True) if agent else []

    if role_ids:
        rule = (
            CommissionRule.objects.filter(role_id__in=role_ids, active=True)
            .order_by("-agent_split_percent")
            .first()
        )
        if rule:
            return rule

    default_rule = CommissionRule.objects.filter(role__isnull=True, active=True).first()
    if default_rule:
        return default_rule

    raise NoCommissionRuleError(
        "No active CommissionRule found for this agent's role, and no default rule is configured. "
        "Seed one via `python3 manage.py seed_commission_rules` or the admin."
    )


def calculate_commission(transaction: Transaction) -> Commission:
    """
    Computes expected commission (transaction.price * transaction.commission_percent)
    and splits it between agent/company per the resolved CommissionRule.
    Creates or updates the transaction's Commission record and returns it.
    """
    rule = resolve_commission_rule(transaction.agent)

    expected = (transaction.price * transaction.commission_percent / Decimal("100")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    agent_share = (expected * rule.agent_split_percent / Decimal("100")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    company_share = expected - agent_share

    try:
        commission = transaction.commission
    except ObjectDoesNotExist:
        commission = Commission(transaction=transaction)

    commission.expected = expected
    commission.agent_share = agent_share
    commission.company_share = company_share
    commission.outstanding = expected - commission.received
    commission.save()

    if transaction.expected_commission != expected:
        transaction.expected_commission = expected
        transaction.save(update_fields=["expected_commission"])

    return commission
