#!/bin/bash 

#gunicorn bigshark.wsgi:application
gunicorn -c gunicorn_config.py bigshark.wsgi
