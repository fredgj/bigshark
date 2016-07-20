import json
import re
import multiprocessing

from django.http import HttpResponse, HttpResponseRedirect, FileResponse, Http404 
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_GET
from django.views.generic import View
from simplemultiprocessing import ProcessPool, ThreadPool

from handlers import file_upload_handler
from models import Song, Playlist
from serializers import jsonify


POOLSIZE = multiprocessing.cpu_count() + 3


class IndexView(View):
    def get(self, request):
        songs = Song.all_by_id()
        playlists = Playlist.all()
        context = {'songs': songs,
                   'playlists': playlists,
                  }
        return render(request, 'music/index.html/', context)

    def post(self, request):
        uploads = request.FILES
        pool = ProcessPool(POOLSIZE)
        pool.map(file_upload_handler, (uploads[key] for key in uploads))
        pool.join()
        return HttpResponseRedirect('/music')

    def delete(self, request):
        pass


class PlaylistView(View):
    def get(self, request):
        raise Http404("Playlist: not found")

    def post(self, request):
        data = json.loads(request.body)
        name = data['name']
        songs = data['songs']
        playlist = Playlist.create(name=name)
        playlist.save()
        pool = ThreadPool(POOLSIZE)
        songs = (Song.get(pk=song_id) for song_id in songs)
        pool.map(playlist.songs.add, songs)
        pool.join()
        return HttpResponseRedirect('/music')
 
    def put(self, request):
        pass

    def delete(self, request):
        pass


@require_GET
def get_all_music(request):
    songs = Song.all_by_timestamp()
    data = jsonify(songs, 'id','name')
    return HttpResponse(data, content_type='application/json')


@require_GET
def get_n_last_added(request, n):
    songs = Song.n_latest(n)
    data = jsonify(songs, 'id','name')
    return HttpResponse(data, content_type='application/json')


@require_GET
def get_playlist_content(request, playlist_id):
    playlist = get_object_or_404(Playlist, pk=playlist_id)
    songs = playlist.songs.all()
    data = jsonify(songs, 'id','name')
    return HttpResponse(data, content_type='application/json')


@require_GET
def get_playlist_id(request, playlist_name):
    playlist = get_object_or_404(Playlist, name=playlist_name)
    data = jsonify(playlist, 'id', single=True)
    return HttpResponse(data, content_type='application/json')


@require_GET
def get_song(request, song_id):
    song = get_object_or_404(Song, pk=song_id)
    response = FileResponse(open(song.path, 'rb'))
    return response


@require_GET
def get_song_name(request, song_id):
    song = Song.get(pk=song_id)
    data = jsonify(song, 'name', single=True)
    return HttpResponse(data, content_type="application/json")


