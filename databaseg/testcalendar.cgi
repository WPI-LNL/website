#!/usr/local/bin/perl -wT
use CGI '-debug';
use CGI::Carp 'fatalsToBrowser';
use strict;
use warnings;
use lib "/home/gregm/Perl/lib/site_perl";
use lib "/home/gregm/Perl/lib/perl5/site_perl";
require PlotCalendar::Month;

my $month = PlotCalendar::Month->new(8,2002);

# global values, to be applied to all cells

# size of whole calendar
$month->size(700,700);

# font sizes for digit, name of day, and text
#$month->font('14','10','8');

# clip text if it wants to wrap?
$month->cliptext('yes');

my (@text, @textref, @url);

for(my $i = 1; $i <= 31; $i++)
    {
    @{$text[$i]} = ("Event Name");
    @{$textref[$i]} = ("<A HREF=\"db.cgi?rm=event_view&ID=216\">");
    $url[$i] = <<EOL;
<A HREF="https://users.wpi.edu/~lnl/database/db.cgi?rm=events_upcoming&MonthStart=08&DayStart=$i&YearStart=2002&MonthEnd=08&DayEnd=$i&YearEnd=2002">
EOL
    }

# Set global values
$month->fgcolor('"#FFFFFF"');
$month->bgcolor('"#000000"');
$month->{TABLEBG} = '"#000000"';

# Wrap a hotlink around the whole day, for each day
$month->htmlref(@url);

# set the text and it's properties for each day
$month->text(@text);
$month->textref(@textref);

# global HTML only options

# allow days to expand vertically to accomodate text

$month->htmlexpand('yes');

# get the html calendar

print <<END;
Content-Type: text/html

<HTML><HEAD><TITLE>Calendar Test</TITLE></HEAD>
<BODY BACKGROUND="/~lnl/Images/bg.gif" TEXT="#FFFFFF" LINK="#FFFF99"
 VLINK="#FFFFCC" ALINK="#FFFFCC">
END
print $month->gethtml;
