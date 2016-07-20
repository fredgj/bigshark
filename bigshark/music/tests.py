from django.test import TestCase, Client

from models import Song, Playlist

class MusicTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Adds some example songs and playlists to the test db
        self.song1 = Song.create(name="song1", path="path1")
        self.song2 = Song.create(name="song2", path="path2")
        self.song3 = Song.create(name="song3", path="path3")       

        self.playlist1 = Playlist.create(name="playlist1")
        self.playlist2 = Playlist.create(name="playlist2")
        self.playlist3 = Playlist.create(name="playlist3")

        self.playlist1.songs.add(self.song1)
        self.playlist1.songs.add(self.song2)
        self.playlist1.songs.add(self.song3)

        self.playlist2.songs.add(self.song1)
        self.playlist2.songs.add(self.song2)

        self.playlist3.songs.add(self.song1)

    def test_music_idex(self):
        response = self.client.get("/music/")
        self.assertEqual(response.status_code, 200)

    def test_get_all_songs(self):
        response = self.client.get("/music/songs/all")
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertTrue(len(response) == 3)

    def test_get_n_last_added(self):
        response = self.client.get("/music/songs/last_3")
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(self.song1.id, response[0]['id'])
        self.assertEqual(self.song1.name, response[0]['name'])
        self.assertEqual(self.song2.id, response[1]['id'])
        self.assertEqual(self.song2.name, response[1]['name'])       
        self.assertEqual(self.song3.id, response[2]['id'])
        self.assertEqual(self.song3.name, response[2]['name'])

    def test_get_playlist_content(self):
        response = self.client.get("/music/playlist/content/"+str(self.playlist1.id))
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertTrue(len(response) == 3) 

        response = self.client.get("/music/playlist/content/"+str(self.playlist2.id))
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertTrue(len(response) == 2) 

        response = self.client.get("/music/playlist/content/"+str(self.playlist3.id))
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertTrue(len(response) == 1) 

    def test_get_playlist_id(self):
        response = self.client.get("/music/playlist/id/"+self.playlist1.name)
        self.assertEqual(response.status_code, 200)
        response = response.json()[0]
        self.assertEqual(response['id'], self.playlist1.id)

    def test_get_song_name(self):
        response = self.client.get("/music/song/name/"+str(self.song1.id))
        self.assertEqual(response.status_code, 200)       
        response = response.json()
        self.assertEqual(response[0]['name'], self.song1.name)

