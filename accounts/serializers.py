from rest_framework import serializers
from accounts.models import User, Role, Department, UserRole


class RoleSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Role
        fields = ["id", "name", "description", "department", "department_name"]


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "description"]


class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    role_ids = serializers.PrimaryKeyRelatedField(
        source="roles", queryset=Role.objects.all(), many=True, write_only=True, required=False
    )
    department_name = serializers.CharField(source="department.name", read_only=True)
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = [
            "id", "email", "phone", "first_name", "last_name",
            "department", "department_name", "roles", "role_ids",
            "is_active", "is_staff", "date_joined", "password",
        ]
        read_only_fields = ["id", "date_joined", "is_staff"]

    def create(self, validated_data):
        role_objs = validated_data.pop("roles", [])
        password = validated_data.pop("password", None)
        user = User.objects.create_user(password=password, **validated_data)
        for role in role_objs:
            UserRole.objects.get_or_create(user=user, role=role)
        return user

    def update(self, instance, validated_data):
        role_objs = validated_data.pop("roles", None)
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if role_objs is not None:
            UserRole.objects.filter(user=instance).exclude(role__in=role_objs).delete()
            for role in role_objs:
                UserRole.objects.get_or_create(user=instance, role=role)
        return instance
