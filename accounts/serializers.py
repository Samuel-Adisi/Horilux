from rest_framework import serializers
from .models import User, Role, Department


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
