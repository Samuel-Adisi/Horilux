import uuid
from django.conf import settings
from django.db import models


class WorkflowTransitionLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=64)
    from_status = models.CharField(max_length=50)
    to_status = models.CharField(max_length=50)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
