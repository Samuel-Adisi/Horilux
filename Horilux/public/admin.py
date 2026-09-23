from django.contrib import admin
from .models import ContactSubmission


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "country", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "email", "phone", "message")
    readonly_fields = ("name", "email", "phone", "country", "message", "created_at")
