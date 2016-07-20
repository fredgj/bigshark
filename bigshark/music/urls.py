from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^playlist$', views.PlaylistView.as_view(), name='playlist'),
    url(r'^playlist/content/(?P<playlist_id>\d+)$', views.get_playlist_content, name='get_playlist_content'),
    url(r'^playlist/id/(?P<playlist_name>\w+)$', views.get_playlist_id, name='get_playlist_id'),
    url(r'^song/id/(?P<song_id>\d+)', views.get_song, name='get__song'),
    url(r'^song/name/(?P<song_id>\d+)$', views.get_song_name, name='get_song_name'),
    url(r'^songs/all$', views.get_all_music, name='get_all_music'),
    url(r'^songs/last_(?P<n>\d+)$', views.get_n_last_added, name='get_n_last_added'),
    url(r'^$', views.IndexView.as_view(), name='index'),
]

