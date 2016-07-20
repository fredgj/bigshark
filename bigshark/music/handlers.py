import re
import os

from models import Song


def parse(uploaded):
    """returns name and the path of where to be saved of an uploaded file""" 
    pattern = r'.*\.[a-zA-Z0-9]{3}'
    name = unicode(uploaded)
    base_dir = 'music/songs/'
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)
    path = base_dir+name
    # checks if filename includes file extension,
    # removes any file extension
    if re.match(pattern, name):
        name = name[:-4]
    return name, path


def file_upload_handler(uploaded):
    """Writes an uploaded file to disk and adds it to the database"""
    name, path = parse(uploaded)
    with open(path, 'wb+') as dest:
        for chunk in uploaded.chunks():
            dest.write(chunk)
    song = Song.create(name=name, path=path)
    song.save()

