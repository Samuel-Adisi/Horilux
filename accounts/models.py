import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class Department(models.Model):
    class Name(models.TextChoices):
        CEO = "ceo", "CEO / MD"
        LISTING = "listing", "Listing"
        SALES = "sales", "Sales"
        MARKETING = "marketing", "Marketing"
        TRANSACTIONS = "transactions", "Transactions / Finance"
        OPERATIONS = "operations", "Operations"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20, choices=Name.choices, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.get_name_display()


class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name="roles", null=True, blank=True)

    def __str__(self):
        return self.name


class Permission(models.Model):
    class Action(models.TextChoices):
        VIEW = "view", "View"
        CREATE = "create", "Create"
        EDIT = "edit", "Edit"
        DELETE = "delete", "Delete"
        ASSIGN = "assign", "Assign"
        APPROVE = "approve", "Approve"
        PUBLISH = "publish", "Publish"
        EXPORT = "export", "Export"

    class Scope(models.TextChoices):
        OWN = "own", "Own"
        ASSIGNED = "assigned", "Assigned"
        TEAM = "team", "Team"
        DEPARTMENT = "department", "Department"
        COMPANY = "company", "Company"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action = models.CharField(max_length=10, choices=Action.choices)
    resource = models.CharField(max_length=50)
    scope = models.CharField(max_length=12, choices=Scope.choices)

    class Meta:
        unique_together = ("action", "resource", "scope")

    def __str__(self):
        return f"{self.action}:{self.resource}:{self.scope}"


class RolePermission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_permissions")
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name="role_permissions")

    class Meta:
        unique_together = ("role", "permission")


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    groups = models.ManyToManyField(
        "auth.Group", related_name="accounts_user_set", blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission", related_name="accounts_user_set", blank=True
    )
    phone = models.CharField(max_length=20, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, null=True, blank=True, related_name="users")
    roles = models.ManyToManyField(Role, through="UserRole", related_name="users")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email


class UserRole(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_roles")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="user_roles")
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "role")
