#!/usr/local/bin/perl -T
use CGI::Carp 'fatalsToBrowser';
use strict;
use warnings;
use lib "/home/lnl/projection";

use Movies;
Movies->new()->run();
