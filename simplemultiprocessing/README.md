Simplemultiprocessing
=====================

This module comes with two pools, a process poll and a thread pool.

The pool from python multiprocessing module doesn't work together objects that cant be 
pickled with the pickle module (serialized), so I decided to write my own pool instead. 
I decided to make a common interface between the two pools, just like Process and Thread from 
the multiprocessing and threading modules.

These pools was made to suit my own needs, thats why this is a stripped down version and map doesn't 
return a new list. I just needed the two pools and the possibility to map a list of inputs to a functionions without any return valus. This implementation is of course a bit slower than the one from 
multiprocessing as it's written in pure python compared to to C. I could probably write a C extension instead, but as of now I don't really need it as the execution time isn't the most critical part at the 
moment.


installation
------------

run **python setup.py install**
