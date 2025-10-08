from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import UserProfile

@receiver(post_save, sender=User)
def create_userProfile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance,
                                   nickname=instance.username,
                                   description=f"Hi my name is {instance.username}"
                                   )
