#!/usr/local/bin/perl -wT
use CGI '-debug';
use CGI::Carp 'fatalsToBrowser';
use strict;
use warnings;
use lib "/home/gregm/Perl/lib/site_perl";
use lib "/home/gregm/Perl/lib/perl5/site_perl";
require PlotCalendar::Month;

my $month = PlotCalendar::Month->new(8,2002);

$month->size(700,700); # width, height in pixels
$month->font('14','10','8');
$month->cliptext('yes');
$month->firstday('Sun'); # First column is Sunday

my @text;
my @daynames;
my @nameref;
my @bgcolor;
my @colors = ('WHITE','#33cc00','#FF99FF','#FF7070','#FFB0B0',);
my (@textcol,@textsize,@textstyle,@textref);
my @style = ('i','u','b',);
my @url;

for (my $i=1;$i<=31;$i++) 
    {
    $daynames[$i] = "Day number $i";
    $nameref[$i] = "<A HREF=\"http://www.$i.ca\">";
    $bgcolor[$i] = $colors[$i%5];
    @{$text[$i]} = ("Text 1 for $i","Second $i text","$i bit of text",);
    @{$textref[$i]} = ("<A HREF=\"http://www.$i.com/\">","Second $i text","<A HREF=\"http://www.$i.net/\">",);
    @{$textcol[$i]} = ($colors[($i+1)%5],$colors[($i+2)%5],$colors[($i+3)%5]);
    @{$textsize[$i]} = ("8","10","8",);
    @{$textstyle[$i]} = @style;
    @style = reverse(@style);
    $url[$i] = '<A href="http://some.org/name_number_' . $i . '">';
    }

$month->fgcolor('BLACK',); #  Global foreground color
$month->bgcolor(@bgcolor); # Background color per day
$month->styles('b','bi','ui',); # Global text styles

my @prefs = ('before','after','after');
my @comments = (['Comment one'],["Comment two","and so on"],['Comment three']);
my @comcol = qw(b g b);
my @comstyle = qw(n b bi);
my @comsize = qw(8 10 14);

$month->comments(\@prefs,\@comments,\@comcol,\@comstyle,\@comsize);

$month->htmlref(@url);

$month->dayname(@daynames);
$month->nameref(@nameref);

$month->text(@text);
$month->textcolor(@textcol);
$month->textsize(@textsize);
$month->textstyle(@textstyle);
$month->textref(@textref);

$month->htmlexpand('yes');

print <<END;
Content-Type: text/html

<HTML><HEAD><TITLE>Calendar Test</TITLE></HEAD>
<BODY BACKGROUND="/~lnl/Images/bg.gif" TEXT="#FFFFFF" LINK="#FFFF99"
 VLINK="#FFFFCC" ALINK="#FFFFCC">
END
print $month->gethtml;
