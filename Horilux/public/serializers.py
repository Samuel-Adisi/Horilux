from rest_framework import serializers
from properties.models import Property
from .models import Customer, SavedProperty, PropertyInquiry

MARKETABLE_STATUSES = ["published", "under_offer", "marketing_ready", "sold_rented"]


class PublicPropertyListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id", "title", "region", "property_type", "listing_type", "price", "currency",
            "bedrooms", "bathrooms", "building_size", "land_size", "status", "cover_image",
            "published_at",
        ]

    def get_cover_image(self, obj):
        first = obj.media.first() if hasattr(obj, "media") else None
        if first and first.file:
            request = self.context.get("request")
            return request.build_absolute_uri(first.file.url) if request else first.file.url
        return None


class PublicPropertyDetailSerializer(serializers.ModelSerializer):
    media = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = "__all__"

    def get_media(self, obj):
        request = self.context.get("request")
        result = []
        for m in obj.media.all():
            url = m.file.url if m.file else None
            if url and request:
                url = request.build_absolute_uri(url)
            result.append({"id": str(m.id), "url": url, "media_type": m.media_type, "order": m.order})
        return result


class CustomerRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def validate_email(self, value):
        if Customer.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop("password")
        customer = Customer(**validated_data)
        customer.set_password(password)
        customer.save()
        return customer


class CustomerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "email", "first_name", "last_name", "phone", "full_name", "created_at"]
        read_only_fields = fields


class SavedPropertySerializer(serializers.ModelSerializer):
    property_detail = PublicPropertyListSerializer(source="property", read_only=True)

    class Meta:
        model = SavedProperty
        fields = ["id", "property", "property_detail", "created_at"]
        read_only_fields = ["id", "created_at", "property_detail"]


class PropertyInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyInquiry
        fields = [
            "id", "property", "message", "requested_viewing",
            "requested_viewing_date", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
