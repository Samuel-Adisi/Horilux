from rest_framework import serializers
from .models import User, Role, Department, UserRole


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description", "department"]


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "description"]


class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    department = DepartmentSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "department",
            "roles",
            "is_active",
            "is_staff",
            "date_joined",
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class UserListItemSerializer(serializers.ModelSerializer):
    """Minimal user shape for agent-picker dropdowns. Identity data only,
    no RBAC gate needed since this is not a scoped business resource."""
    full_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(source="department.name", default=None, read_only=True)

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "department_name"]
        read_only_fields = fields

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class StaffWriteSerializer(serializers.ModelSerializer):
    """
    Create/update serializer for CEO-managed staff records.
    Email is only settable at creation (immutable identifier afterwards).
    Password is write-only and only used on create -- there is no invite/
    email flow, so the CEO sets a temporary password directly, same as
    seed_test_users.py does for local test accounts.
    role is a single Role id -- the seeded data assigns exactly one role
    per user, so this mirrors that instead of inventing multi-role UI.
    """
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), write_only=True, required=False, allow_null=True
    )
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "phone",
            "department", "is_active", "password", "role",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        role = validated_data.pop("role", None)
        user = User.objects.create_user(password=password, **validated_data)
        if role is not None:
            UserRole.objects.get_or_create(user=user, role=role)
        return user

    def update(self, instance, validated_data):
        validated_data.pop("email", None)  # immutable after creation
        password = validated_data.pop("password", None)
        role = validated_data.pop("role", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if role is not None:
            UserRole.objects.filter(user=instance).delete()
            UserRole.objects.get_or_create(user=instance, role=role)
        return instance
