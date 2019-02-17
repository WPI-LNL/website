#!/usr/local/bin/perl -T
use CGI '-debug';
use CGI::Carp 'fatalsToBrowser';
use strict;
use warnings;
use lib "/home/gregm/Perl/database";
use lib "/home/gregm/Perl/lib/perl5/site_perl";
use lib "/home/gregm/Perl/lib/perl5/test_site_perl";
use LnLDB;
LnLDB->new(PARAMS => { config => "devel.db"})->run();
#LnLDB->new()->run();
