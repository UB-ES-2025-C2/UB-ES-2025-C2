"""signals.py"""

import pathlib

from django.contrib.auth.models import User
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

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
def delete_old_profile_pic(
    sender: type[UserProfile],  # noqa: ARG001
    instance: UserProfile,
    **kwargs: dict,  # noqa: ARG001
) -> None:
    """Elimina l'arxiu de la imatge de perfil antiga abans de desar una nova."""
    if instance.pk and UserProfile.objects.filter(pk=instance.pk).exists():
        old_file = UserProfile.objects.get(pk=instance.pk).profilePic
        new_file = instance.profilePic
        if (
            old_file and old_file != new_file and old_file.name != default_name
        ) and pathlib.Path(old_file.path).exists():
            pathlib.Path(old_file.path).unlink()


@receiver(post_delete, sender=UserProfile)
def delete_profile_pic_on_delete(
    sender: type[UserProfile],  # noqa: ARG001
    instance: UserProfile,
    **kwargs: dict,  # noqa: ARG001
) -> None:
    """Elimina l'arxiu de la imatge de perfil quan es elimina el UserProfile."""
    if (
        instance.profilePic
        and instance.profilePic.name != default_name
        and pathlib.Path(instance.profilePic.path).exists()
    ):
        pathlib.Path(instance.profilePic.path).unlink()
