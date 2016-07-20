from __future__ import unicode_literals

from django.db import models


class Song(models.Model):
    name = models.CharField(max_length=300)
    path =  models.CharField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        get_latest_by = 'timestamp'

    @classmethod
    def all(cls):
        return cls.objects.all()
    
    @classmethod
    def all_by_id(cls):
        return cls.objects.order_by('id')

    @classmethod
    def all_by_timestamp(cls):
        return cls.objects.order_by('timestamp')

    @classmethod
    def create(cls, **kwargs):
        return cls.objects.create(**kwargs)
    
    @classmethod
    def get(cls, **kwargs):
        return cls.objects.get(**kwargs)

    @classmethod
    def n_latest(cls,n):
        n = int(n)
        return list(cls.objects.order_by('-timestamp'))[n-1::-1]

    def __unicode__(self):
        return unicode(self.name)


class Playlist(models.Model):
    name = models.CharField(max_length=100, unique=True)
    songs = models.ManyToManyField(Song)

    @classmethod
    def all(cls):
        return cls.objects.all()

    @classmethod
    def create(cls, **kwargs):
        return cls.objects.create(**kwargs)
    
    @classmethod
    def get(cls, **kwargs):
        return cls.objects.get(**kwargs)

    def __unicode__(self):
        return unicode(self.name)

