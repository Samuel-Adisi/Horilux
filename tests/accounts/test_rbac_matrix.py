"""
Automated permission-matrix tests -- Phase 9.

Iterates the REAL RBAC_MATRIX from seed_rbac.py (not a hand-copied
duplicate) and asserts has_permission() matches for every
(role, resource, action) combination it grants, and that roles have
NO access to resource/action pairs the matrix does not grant them.

This is the test that would have caught both real bugs found during
manual Phase 7/8 verification: the Marketing "team"-scope created_by
gap, and the generic "report" resource leaking cross-department access.
"""
import pytest

from accounts.management.commands.seed_rbac import RBAC_MATRIX
from accounts.permissions import has_permission
from accounts.models import User


pytestmark = pytest.mark.django_db


def all_role_resource_actions():
    """Yield (role, resource, action) for every grant in the real matrix."""
    for role, resource_actions in RBAC_MATRIX.items():
        for resource, actions in resource_actions.items():
            for action in actions:
                yield role, resource, action


def all_resources():
    resources = set()
    for resource_actions in RBAC_MATRIX.values():
        resources.update(resource_actions.keys())
    return resources


def all_actions():
    actions = set()
    for resource_actions in RBAC_MATRIX.values():
        for actions_set in resource_actions.values():
            actions.update(actions_set)
    return actions


@pytest.mark.parametrize("role,resource,action", list(all_role_resource_actions()))
def test_role_has_granted_permission(user_factory, seed_rbac, role, resource, action):
    """Every (role, resource, action) the matrix grants must be allowed."""
    user = user_factory(role_name=role)
    assert has_permission(user, action, resource) is True, (
        f"{role} should have {action}:{resource} per RBAC_MATRIX but does not"
    )


@pytest.mark.parametrize("role", list(RBAC_MATRIX.keys()))
def test_role_has_no_ungranted_permissions(user_factory, seed_rbac, role):
    """
    For every (resource, action) pair NOT in this role's matrix entry,
    the role must NOT have that permission. This is the check that
    catches cross-department leaks like the generic "report" bug.
    """
    user = user_factory(role_name=role)
    granted = RBAC_MATRIX[role]

    for resource in all_resources():
        allowed_actions = granted.get(resource, set())
        for action in all_actions():
            if action in allowed_actions:
                continue
            assert has_permission(user, action, resource) is False, (
                f"{role} should NOT have {action}:{resource} "
                f"(not in RBAC_MATRIX[{role!r}]) but has_permission() returned True"
            )


def test_superuser_has_full_access(user_factory, seed_rbac):
    """Superuser bypasses RBAC entirely per accounts/permissions.py get_user_scopes()."""
    superuser = User.objects.create_superuser(
        email="superuser@horilux.test", password="TestPass123!",
        first_name="Super", last_name="User",
    )
    for resource in all_resources():
        for action in all_actions():
            assert has_permission(superuser, action, resource) is True


def test_unauthenticated_user_has_no_access():
    """AnonymousUser (is_authenticated=False) must be denied everything."""
    class FakeAnonymous:
        is_authenticated = False

    for resource in all_resources():
        for action in all_actions():
            assert has_permission(FakeAnonymous(), action, resource) is False
