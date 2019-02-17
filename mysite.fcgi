#!/isihome/lnl/bin/python

import sys,os

sys.path.insert(0, "/isihome/lnl/lnldb")

os.chdir("/isihome/lnl/lnldb/")

os.environ['DJANGO_SETTINGS_MODULE'] = "lnldb.settings"


from django.core.servers.fastcgi import runfastcgi
runfastcgi(method="threaded",daemonize="false")
#import django.core.handlers.wsgi
#application = django.core.handlers.wsgi.WSGIHandler()

