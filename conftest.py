import pytest
from accounts.models import Department, Role, User, UserRole
from accounts.management.commands.seed_rbac import Command as SeedRBACCommand


@pytest.fixture(scope="session")
def django_db_setup(django_db_setup, django_db_blocker):
    """Seed RBAC once for the whole test session instead of per-test."""
    with django_db_blocker.unblock():
        SeedRBACCommand().handle()
    yield


@pytest.fixture
def seed_rbac(db):
    """No-op -- seeding happens once via django_db_setup above.
    Kept as a fixture name so tests don't need editing."""
    pass


@pytest.fixture
def department_factory(db):
    def make(name):
        dept, _ = Department.objects.get_or_create(name=name)
        return dept
    return make


@pytest.fixture
def role_factory(db, seed_rbac):
    def make(name):
        return Role.objects.get(name=name)
    return make


@pytest.fixture
def user_factory(db):
    counter = {"n": 0}

    def make(role_name=None, department=None, **kwargs):
        counter["n"] += 1
        n = counter["n"]
        email = kwargs.pop("email", f"testuser{n}@horilux.test")
        user = User.objects.create_user(
            email=email,
            password="TestPass123!",
            first_name=kwargs.pop("first_name", "Test"),
            last_name=kwargs.pop("last_name", "User"),
            department=department,
            **kwargs,
        )
        if role_name:
            role = Role.objects.get(name=role_name)
            UserRole.objects.create(user=user, role=role)
            if department is None and role.department:
                user.department = role.department
                user.save(update_fields=["department"])
        return user
    return make
