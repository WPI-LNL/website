#!/usr/bin/env python2.7
import sys
import os

LNL_PATH = "/isihome/lnl/lnldb_gitd/"
INTERP = "/isihome/lnl/bin/python2.7"
if sys.executable != INTERP: os.execl(INTERP, INTERP, *sys.argv)

sys.path.append(LNL_PATH)
os.environ['DJANGO_SETTINGS_MODULE'] = 'lnldb.settings'

import django.core.handlers.wsgi

application = django.core.handlers.wsgi.WSGIHandler()

#def application(environ, start_response):
    #write = start_response('200 OK', [('Content-type', 'text/plain')])
    #return ["Hello, world!"]