from django.db import models


class SongManager(models.Manager):
    def filter_query(self, name=None, topic=None, artist=None, exact_name=False):
        """
        Filtra cançons segons topic, artist o playlist (si s’especifiquen).
        Si no hi ha filtres, retorna totes.
        """
        qs = self.all()
        if name:
            if exact_name:
                qs = qs.filter(name__iexact=name)
            else:
                qs = qs.filter(name__icontains=name)

        if topic:
            qs = qs.filter(topic__icontains=topic)

        if artist:
            qs = qs.filter(artist__icontains=artist)

        return qs


class PlayListManager(models.Manager):
    def filter_query(self, name=None, topic=None, exact_name=False):
        qs = self.all()
        if name:
            if exact_name:
                qs = qs.filter(name__iexact=name)
            else:
                qs = qs.filter(name__icontains=name)

        if topic:
            qs = qs.filter(topic__icontains=topic)

        return qs
