Bigshark
========

Bigshark is a music streaming/cloud service for sharing your music between all your devices. The 
name BigShark is a reference a Grooveshark app called tinyshark (a pretty silly name in my opinion) 
that was available in the android app store a few years back.

It has been testet on several browsers, and it currently works on google chrome (Ubuntu and Android) 
and all the different Android browsers I have testet.
I also got to test it on Safari for iOS, but the audio player didn't work, but since I dont't have an 
iphone i'm not gonna do anything with this issue anytime soon.

There are some minor issues/bugs with the audio player both on Ubuntu and Android, different issues 
though, but it still plays music as it was intended to do.

The app is built with Django and PostreSQL on the serverside and bootstrap + plain JavaScript and 
jQuery on the frontend.


Fire up your own BigShark
-------------------------

First install the simplemultiprocessing module. Cd to the simplemultiprocessing folder and run setup.py
in order to install the module.

Then go to settings.py and add your database and host.

If your are gonna run this with gunicorn, go to gunicorn\_config.py and set "command" and 
"pythonpath" to your gunicorn and python executable.
