from rest_framework import serializers

from .models import (
    PropertyOwner,
    Property,
    PropertyMedia,
    PropertyDocument,
    VerificationChecklist,
)


class PropertyOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyOwner
        fields = [
            "id", "name", "phone", "email", "id_document", "address", "notes", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class PropertyMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyMedia
        fields = ["id", "property", "file", "media_type", "order", "uploaded_by", "uploaded_at"]
        read_only_fields = ["id", "uploaded_by", "uploaded_at"]


class PropertyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyDocument
        fields = ["id", "property", "file", "doc_type", "uploaded_by", "verified", "uploaded_at"]
        read_only_fields = ["id", "uploaded_by", "verified", "uploaded_at"]


class VerificationChecklistSerializer(serializers.ModelSerializer):
    is_complete = serializers.SerializerMethodField()

    class Meta:
        model = VerificationChecklist
        fields = [
            "id", "property",
            "owner_info_ok", "price_ok", "location_ok", "details_ok",
            "photos_ok", "documents_ok", "commission_agreement_ok",
            "manager_approved", "approved_by", "approved_at", "is_complete",
        ]
        read_only_fields = ["id", "manager_approved", "approved_by", "approved_at"]

    def get_is_complete(self, obj):
        return obj.is_complete()


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — avoids over-fetching nested data."""

    sqft = serializers.DecimalField(source="building_size", max_digits=10, decimal_places=2, read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id", "title", "property_type", "listing_type", "price", "currency",
            "location", "region", "bedrooms", "bathrooms", "status", "completion_percent",
            "agent", "created_at", "amenities", "rental_period", "sqft", "image_url",
        ]

    def get_image_url(self, obj):
        first_photo = obj.media.filter(media_type="photo").order_by("order").first()
        if not first_photo or not first_photo.file:
            return None
        request = self.context.get("request")
        url = first_photo.file.url
        return request.build_absolute_uri(url) if request else url


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Full serializer for retrieve/create/update — includes nested read-only relations."""

    media = PropertyMediaSerializer(many=True, read_only=True)
    documents = PropertyDocumentSerializer(many=True, read_only=True)
    verification = VerificationChecklistSerializer(read_only=True)
    owner_detail = PropertyOwnerSerializer(source="owner", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id", "title", "property_type", "listing_type", "price", "currency",
            "location", "region", "address", "bedrooms", "bathrooms", "land_size", "building_size",
            "amenities", "rental_period", "description", "owner", "owner_detail", "agent", "status",
            "completion_percent", "media", "documents", "verification",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "completion_percent", "created_at", "updated_at"]
