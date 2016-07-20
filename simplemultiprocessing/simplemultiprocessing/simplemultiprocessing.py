import abc
from multiprocessing import Process
from threading import Thread


class Pool(object):
    def __init__(self, num_procs=1):
        self.maxsize = num_procs
        self.jobs = []

    @abc.abstractmethod
    def _insert_job(self, func, args):
        pass

    def _update_jobs(self):
        # join termiated jobs, keep the ones still running, simple as that
        for job in self.jobs:
            if job.is_alive():
                yield job
            else:
                job.join()

    def join(self):
        for job in self.jobs:
            job.join()

    def map(self, func, args_seq):
        for args in args_seq:
            if not isinstance(args, tuple):
                args = (args,)
            while not self._insert_job(func, args):
                # while waiting for a free spot in the job list, update
                # the job list to make space for new jobs
                self.jobs = [job for job in self._update_jobs()]


class ProcessPool(Pool):
    def _insert_job(self, func, args):
        if len(self.jobs) < self.maxsize:
            job = Process(target=func, args=args)
            job.start()
            self.jobs.append(job)
            return True


class ThreadPool(Pool):
    def _insert_job(self, func, args):
        if len(self.jobs) < self.maxsize:
            job = Thread(target=func, args=args)
            job.start()
            self.jobs.append(job)
            return True


