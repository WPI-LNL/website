#!/bin/perl 

use strict;


my $database_path = "/home/gregm/Perl/database";

my %CONFIG;	

tie %CONFIG, "DB_File", "/home/gregm/Perl/database/config.db", O_RDONLY or
        die("Error opening configuration\n");

#!/usr/bin/perl -wT
print "Content-type: text/html\n\n";
print "Config: \n";
print CONFIG;
