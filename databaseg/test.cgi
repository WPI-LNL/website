#!/usr/local/bin/perl -w

use CGI '-debug';
use CGI::Carp 'fatalsToBrowser';
use strict;
use warnings;

my $query = new CGI;

my @fields = split(/,\s*/, $query->param('surveyFields'));

print <<END;
Content-Type: text/html

<HTML><HEAD><TITLE>Calendar Test</TITLE></HEAD>
<BODY><pre>
END

print `perldoc Time::Piece`;

print "</pre></BODY></HTML>";
