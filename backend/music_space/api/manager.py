"""manager.py"""

from django.db import models


class SongManager(models.Manager):
    """Manager per a cançons."""

    def filter_query(
        self,
        name: str | None = None,
        topic: str | None = None,
        artist: str | None = None,
        *,
        exact_name: bool = False,
    ) -> models.QuerySet:
        """
        Filtra cançons segons topic, artist o playlist (si s’especifiquen).

        Si no hi ha filtres, retorna totes.

        Returns
        -------
            QuerySet[Song]: El queryset filtrat segons els criteris especificats.
        """  # noqa: RUF002
        qs = self.all()
        if name:
            qs = (
                qs.filter(name__iexact=name)
                if exact_name
                else qs.filter(name__icontains=name)
            )

        if topic:
            qs = qs.filter(topic__icontains=topic)

        if artist:
            qs = qs.filter(artist__icontains=artist)

        return qs


class PlayListManager(models.Manager):
    """Manager per a playlists."""

    def filter_query(
        self,
        name: str | None = None,
        topic: str | None = None,
        *,
        exact_name: bool = False,
    ) -> models.QuerySet:
        """
        Filtra playlists segons topic o nom (si s’especifiquen).

        Si no hi ha filtres, retorna totes.

        Returns
        -------
            QuerySet[PlayList]: El queryset filtrat segons els criteris especificats.
        """  # noqa: RUF002
        qs = self.all()
        if name:
            qs = (
                qs.filter(name__iexact=name)
                if exact_name
                else qs.filter(name__icontains=name)
            )

        if topic:
            qs = qs.filter(topic__icontains=topic)

        return qs
