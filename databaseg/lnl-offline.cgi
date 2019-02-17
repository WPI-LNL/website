#!/usr/local/bin/perl -T

use CGI '-debug';
use CGI::Carp 'fatalsToBrowser';

print <<END;
Content-Type: text/html

<HTML><HEAD><TITLE>Database Offline</TITLE></HEAD>
<BODY>
<H1>The database is currently offline for maintenance.  Please check back later.</H1>
</BODY></HTML>
END
