import multiprocessing

command = '/home/ubuntu/.virtualenvs/bigshark/bin/gunicorn'
pythonpath = '/home/ubuntu/.virtualenvs/bigshark/bin/python'
bind = '127.0.0.1:8000'
# workers set to whats recomended in the gunicorn docs
workers = (2*multiprocessing.cpu_count())+1 
