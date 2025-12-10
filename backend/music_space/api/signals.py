"""signals.py"""


from django.contrib.auth.models import User
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver
from django.core.files.storage import default_storage
from .models import UserProfile

default_name = 'profile_pics/default.png'


@receiver(post_save, sender=User)
def create_userprofile(
    sender: type[User],  # noqa: ARG001
    instance: User,
    created: bool,  # noqa: FBT001
    **kwargs: dict,  # noqa: ARG001
) -> None:
    """Crea un UserProfile quan es crea un nou User."""
    if created:
        UserProfile.objects.create(
            user=instance,
            nickname=instance.username,
            description=f"Hi my name is {instance.username}",
        )


@receiver(pre_save, sender=UserProfile)
def delete_old_profile_pic(sender, instance, **kwargs):
    """Elimina l'arxiu antic usant default_storage (funciona local/S3)."""
    if instance.pk:
        try:
            old_instance = UserProfile.objects.get(pk=instance.pk)
            old_file = old_instance.profilePic
            new_file = instance.profilePic

            if (old_file and old_file != new_file and old_file.name != default_name
                and old_file.name):  # Si té nom, existeix remotament
                default_storage.delete(old_file.name)  # Funciona sempre
        except UserProfile.DoesNotExist:
            pass


@receiver(post_delete, sender=UserProfile)
def delete_profile_pic_on_delete(sender, instance, **kwargs):
    """Elimina l'arxiu en post_delete usant storage API."""
    if (instance.profilePic and instance.profilePic.name != default_name
        and instance.profilePic.name):
        default_storage.delete(instance.profilePic.name)
