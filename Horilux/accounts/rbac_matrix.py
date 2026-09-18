"""
Single source of truth for the seeded RBAC matrix.

Shape:
    RBAC_MATRIX[role][resource] = {actions}
    ROLE_SCOPE[role] = default scope for every grant of that role
    SCOPE_OVERRIDES[(role, resource)] or SCOPE_OVERRIDES[(role, resource, action)]
        = scope for that specific grant (the 3-tuple wins over the 2-tuple,
          which wins over ROLE_SCOPE).

Scope is stored per Permission row (action, resource, scope), and each
RolePermission links a role to exactly one such row per (resource, action),
so a single role can hold different scopes for different grants.

`sync_rbac()` is used both by the `seed_rbac` management command and by the
accounts data migration, so it only takes model classes as arguments (works
with historical models).
"""

RBAC_MATRIX = {
    "CEO": {
        "property": {"view", "create", "edit", "delete", "approve", "publish", "export"},
        "property_verification": {"view", "edit", "approve"},
        "lead": {"view", "assign", "export"},
        "client": {"view", "export"},
        "interaction": {"view", "export"},
        "lead_source_stats": {"view", "export"},
        "viewing": {"view", "export"},
        "followup": {"view", "export"},
        "transaction": {"view", "approve", "export"},
        "payment_commission": {"view", "export"},
        "marketing_campaign": {"view", "export"},
        "user_management": {"view", "create", "edit", "delete", "assign"},
        "report_listing": {"view", "export"},
        "report_sales": {"view", "export"},
        "report_marketing": {"view", "export"},
        "report_finance": {"view", "export"},
        "report_operations": {"view", "export"},
        "audit_log": {"view"},
        "company_settings": {"view", "edit"},
        "task": {"view", "create", "edit", "delete"},
    },
    "Listing": {
        "property": {"view", "create", "edit", "approve"},
        "property_verification": {"view", "create", "edit"},
        "report_listing": {"view"},
        "task": {"view", "edit"},
    },
    "Sales": {
        "property": {"view"},
        "lead": {"view", "create", "edit", "assign"},
        "client": {"view", "create", "edit"},
        "interaction": {"view", "create", "edit"},
        "viewing": {"view", "create", "edit"},
        "followup": {"view", "create", "edit"},
        "transaction": {"view", "create", "edit"},
        "report_sales": {"view"},
        "task": {"view", "edit"},
    },
    "Marketing": {
        # Company scope, but the property queryset is limited to
        # marketing_ready/published for Marketing-department users
        # (see properties.views.PropertyViewSet.get_queryset).
        "property": {"view"},
        "marketing_campaign": {"view", "create", "edit", "publish"},
        "report_marketing": {"view"},
        "task": {"view", "edit"},
    },
    "Finance": {
        "property": {"view"},
        "client": {"view"},
        "transaction": {"view", "create", "edit"},
        "payment_commission": {"view", "create", "edit", "approve"},
        "report_finance": {"view", "export"},
        "task": {"view", "edit"},
    },
    "Operations": {
        "property": {"view"},
        "property_verification": {"view"},
        "lead": {"view", "assign"},
        "client": {"view"},
        "interaction": {"view"},
        "lead_source_stats": {"view"},
        "viewing": {"view", "edit"},
        "followup": {"view", "edit"},
        "transaction": {"view"},
        "marketing_campaign": {"view"},
        "user_management": {"view", "create", "edit"},  # staff records only
        "report_operations": {"view", "export"},
        "audit_log": {"view"},
        "task": {"view", "create", "edit", "delete"},
    },
}

# Default scope per role -- matches spec section 4 access-scope assignments.
ROLE_SCOPE = {
    "CEO": "company",
    "Listing": "team",
    "Sales": "assigned",
    "Marketing": "team",
    "Finance": "company",
    "Operations": "company",
}

# Per-grant scope overrides. Keys are (role, resource) or (role, resource, action).
SCOPE_OVERRIDES = {
    # Sales browses the whole catalogue (read-only) to book viewings.
    ("Sales", "property"): "company",
    # Marketing sees company-wide, narrowed by status in the property queryset.
    ("Marketing", "property"): "company",
    # Non-management roles only see/edit tasks they own (task.owner == user).
    ("Listing", "task"): "own",
    ("Sales", "task"): "own",
    ("Marketing", "task"): "own",
    ("Finance", "task"): "own",
}

DEPARTMENT_KEY_FOR_ROLE = {
    "CEO": "ceo",
    "Listing": "listing",
    "Sales": "sales",
    "Marketing": "marketing",
    "Finance": "transactions",
    "Operations": "operations",
}

DEPARTMENT_KEYS = ["ceo", "listing", "sales", "marketing", "transactions", "operations"]


def scope_for(role: str, resource: str, action: str) -> str:
    if (role, resource, action) in SCOPE_OVERRIDES:
        return SCOPE_OVERRIDES[(role, resource, action)]
    if (role, resource) in SCOPE_OVERRIDES:
        return SCOPE_OVERRIDES[(role, resource)]
    return ROLE_SCOPE[role]


def desired_grants(role: str):
    """Yield (action, resource, scope) for every grant of `role`."""
    for resource, actions in RBAC_MATRIX[role].items():
        for action in sorted(actions):
            yield action, resource, scope_for(role, resource, action)


def sync_rbac(Department, Role, Permission, RolePermission, log=None):
    """
    Idempotently bring the DB in line with the matrix above:
      * creates missing departments / roles / permissions / links
      * removes RolePermission links on the SEEDED roles that are no longer
        in the matrix (e.g. an old scope for a grant whose scope changed).
    Roles not named in RBAC_MATRIX are never touched.

    Returns a dict of counters.
    """
    log = log or (lambda msg: None)
    stats = {"departments": 0, "roles": 0, "permissions": 0, "links_added": 0, "links_removed": 0}

    departments = {}
    for key in DEPARTMENT_KEYS:
        dept, created = Department.objects.get_or_create(name=key)
        departments[key] = dept
        if created:
            stats["departments"] += 1
            log(f"  Department created: {key}")

    for role_name, dept_key in DEPARTMENT_KEY_FOR_ROLE.items():
        role, created = Role.objects.get_or_create(
            name=role_name, defaults={"department": departments[dept_key]},
        )
        if created:
            stats["roles"] += 1
            log(f"  Role created: {role_name}")

        keep_ids = set()
        for action, resource, scope in desired_grants(role_name):
            perm, perm_created = Permission.objects.get_or_create(
                action=action, resource=resource, scope=scope,
            )
            if perm_created:
                stats["permissions"] += 1
            link, link_created = RolePermission.objects.get_or_create(role=role, permission=perm)
            keep_ids.add(link.pk)
            if link_created:
                stats["links_added"] += 1
                log(f"  + {role_name}: {action}:{resource}:{scope}")

        stale = RolePermission.objects.filter(role=role).exclude(pk__in=keep_ids)
        for link in stale.select_related("permission"):
            p = link.permission
            log(f"  - {role_name}: {p.action}:{p.resource}:{p.scope}")
        removed, _ = stale.delete()
        stats["links_removed"] += removed

    return stats
