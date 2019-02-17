#!/usr/local/bin/perl -w
print <<EOF;
Content-type: text/html
Cache-control: no cache

<HTML>
<HEAD><TITLE>Updating Database from RCS</TITLE></HEAD>
<BODY><H1>Updating Database from RCS</H1>
<PRE>
EOF

open(SAVEERR, ">&STDERR");
open(STDERR, ">&STDOUT"); 
system "/home/lnl/database/refresh";
print <<EOF;
</PRE>
</BODY>
</HTML>
EOF
