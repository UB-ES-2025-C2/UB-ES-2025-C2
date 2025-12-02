
import pathlib

from django.contrib.auth.models import User
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from .models import UserProfile


@receiver(post_save, sender=User)
def create_userProfile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(
            user=instance,
            nickname=instance.username,
            description=f"Hi my name is {instance.username}",
        )


@receiver(pre_save, sender=UserProfile)
def delete_old_profile_pic(sender, instance, **kwargs):
    if instance.pk and UserProfile.objects.filter(pk=instance.pk).exists():
        old_file = UserProfile.objects.get(pk=instance.pk).profilePic
        new_file = instance.profilePic
        if old_file and old_file != new_file and old_file.name != 'profile_pics/default.png':
            if pathlib.Path(old_file.path).exists():
                pathlib.Path(old_file.path).unlink()


@receiver(post_delete, sender=UserProfile)
def delete_profile_pic_on_delete(sender, instance, **kwargs):
    if instance.profilePic and instance.profilePic.name != 'profile_pics/default.png':
        if pathlib.Path(instance.profilePic.path).exists():
            pathlib.Path(instance.profilePic.path).unlink()
