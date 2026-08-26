"""
RBAC permission resolver.

Core question this answers: can `user` perform `action` on `resource`,
given the target `obj` (or queryset scope)?

Scope resolution order: Own -> Assigned -> Team -> Department -> Company
The highest-scope match the user's roles grant is used.
"""
from accounts.models import Permission, RolePermission


SCOPE_RANK = {
    "own": 1,
    "assigned": 2,
    "team": 3,
    "department": 4,
    "company": 5,
}


def get_user_scopes(user, action: str, resource: str) -> set[str]:
    """Return the set of scopes this user's roles grant for (action, resource)."""
    if user.is_superuser:
        return {"company"}

    role_ids = user.user_roles.values_list("role_id", flat=True)
    scopes = (
        RolePermission.objects.filter(
            role_id__in=role_ids,
            permission__action=action,
            permission__resource=resource,
        )
        .values_list("permission__scope", flat=True)
        .distinct()
    )
    return set(scopes)


def has_permission(user, action: str, resource: str, obj=None) -> bool:
    """
    True/False check for a single object or a general capability check
    (obj=None checks if the user has ANY scope for this action/resource,
    useful for e.g. showing a 'Create' button server-side gating).
    """
    if not user or not user.is_authenticated:
        return False

    scopes = get_user_scopes(user, action, resource)
    if not scopes:
        return False

    if obj is None:
        return True

    if "company" in scopes:
        return True

    if "department" in scopes:
        obj_dept = getattr(obj, "department_id", None) or _infer_department(obj)
        if obj_dept and obj_dept == user.department_id:
            return True

    if "team" in scopes:
        agent = getattr(obj, "agent", None) or getattr(obj, "assigned_agent", None)
        if agent and agent.department_id == user.department_id:
            return True

    if "assigned" in scopes:
        agent = getattr(obj, "agent", None) or getattr(obj, "assigned_agent", None) or getattr(obj, "responsible_agent", None)
        if agent and agent_id_matches(agent, user):
            return True

    if "own" in scopes:
        owner_field = getattr(obj, "created_by", None) or getattr(obj, "uploaded_by", None) or getattr(obj, "owner", None)
        if owner_field and agent_id_matches(owner_field, user):
            return True

    return False


def agent_id_matches(agent_field, user) -> bool:
    return getattr(agent_field, "id", None) == user.id


def _infer_department(obj):
    agent = getattr(obj, "agent", None) or getattr(obj, "assigned_agent", None)
    return agent.department_id if agent else None


def filter_queryset_for_user(user, action: str, resource: str, queryset, agent_field="agent"):
    """
    Given a queryset, restrict it to what `user` is allowed to see/act on
    for (action, resource), based on their highest granted scope.
    """
    if user.is_superuser:
        return queryset

    scopes = get_user_scopes(user, action, resource)
    if not scopes:
        return queryset.none()

    if "company" in scopes:
        return queryset

    if "department" in scopes or "team" in scopes:
        return queryset.filter(**{f"{agent_field}__department_id": user.department_id})

    if "assigned" in scopes or "own" in scopes:
        return queryset.filter(**{agent_field: user})

    return queryset.none()


# ---------------------------------------------------------------------------
# DRF integration
# ---------------------------------------------------------------------------
from rest_framework.permissions import BasePermission


class RBACPermission(BasePermission):
    """
    Generic DRF permission class driven by the RBAC resolver above.

    Usage on a ViewSet:

        class PropertyViewSet(viewsets.ModelViewSet):
            permission_classes = [RBACPermission]
            rbac_resource = "property"
            rbac_action_map = {
                "list": "view", "retrieve": "view",
                "create": "create", "update": "edit", "partial_update": "edit",
                "destroy": "delete",
            }

    `rbac_resource` is required. `rbac_action_map` is optional — if omitted,
    the DRF action name is used directly as the RBAC action (works for
    "assign"/"approve"/"publish"/"export" custom @action methods too, as
    long as the @action's `url_path`/method name matches an RBAC action).
    """

    default_action_map = {
        "list": "view",
        "retrieve": "view",
        "create": "create",
        "update": "edit",
        "partial_update": "edit",
        "destroy": "delete",
    }

    def _resolve_action(self, view):
        action_map = getattr(view, "rbac_action_map", self.default_action_map)
        drf_action = getattr(view, "action", None)
        return action_map.get(drf_action, drf_action)

    def has_permission(self, request, view):
        resource = getattr(view, "rbac_resource", None)
        if resource is None:
            raise NotImplementedError(
                f"{view.__class__.__name__} must set `rbac_resource` to use RBACPermission."
            )
        action = self._resolve_action(view)
        if action is None:
            return False
        # Object-level checks happen in has_object_permission for detail routes;
        # here we only confirm the user has SOME scope for this action/resource.
        return has_permission(request.user, action, resource, obj=None)

    def has_object_permission(self, request, view, obj):
        resource = getattr(view, "rbac_resource", None)
        action = self._resolve_action(view)
        return has_permission(request.user, action, resource, obj=obj)
