#!/usr/local/bin/perl -T
use CGI::Carp 'fatalsToBrowser';
use strict;
use warnings;
use lib "/home/lnl/database";
use lib "/home/gregm/Perl/lib/perl5/site_perl";
use LnLDB;
LnLDB->new()->run();
