package LnLDB2;
use base 'CGI::Application';
use strict;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
use DB_File;
use XML::Simple;
use XML::Writer;
use XML::Writer::String;

# define the database path
my $database_path = "/home/lnl/database2";

# define the globals
our ($dateform, $dbh, $ip_addr, $login, $page, $username, %modes);

# define an XML writer and output string
my $output = XML::Writer::String->new();
my $writer = new XML::Writer( OUTPUT => $output );

# setup the database script
sub setup
{
	my $self = shift;
	
	CGI::Carp::set_message(\&Error);
	
	# set query to the incoming URL
	$page = $self->query();

	# get the username and IP address or set them to blank
	$username = $ENV{REMOTE_USER};
	$ip_addr  = $ENV{REMOTE_ADDR};
	
	$username = '' unless defined $username;
	$ip_addr  = '' unless defined $ip_addr;
	
	# get the user's login. if they arn't logged in, send an error
	$login = $ENV{REMOTE_USER};
	if(length($login) < 1) { getError(); }

	# Set up the run modes
	$self->run_modes(\%modes);

	# get the run mode
	my $rm = $page->param('rm');

	# setup the database
	my $host = "mysql.wpi.edu";
	my $db   = "bobtest";
	my $user = "rbreznak";
	my $pass = "oHcCBM";

	# make the database connection string
	my $db_str = "DBI:mysql:$db:$host";

	# Attempt to connect to the database
	$dbh = DBI->connect($db_str, $user, $pass);

	# check for a fatal condition
	defined($dbh) or die("Can not connect to database\n");
	
	# set the headers to XML
    $self->header_type('header');
    $self->header_props(-type=>'text/xml');
    
    if(!isOfficer()) { GetError(); } 
}

sub isOfficer
{
	my $query = $dbh->prepare("SELECT member_status
	                        FROM members
	                        WHERE member_wpiid = '$login'
	                        LIMIT 1");
	$query->execute;
	
	if($query->rows == 0) { 
		GetError();
	} else {
		my @results=$query->fetchrow();
		
		if($results[0] eq "Advisor"            || $results[0] eq "President" || 
		   $results[0] eq "Vice-President"     || $results[0] eq "Technical Director" || 
		   $results[0] eq "Treasurer"          || $results[0] eq "Head Projectionist" || 
		   $results[0] eq "Secretary"          || $results[0] eq "Webmaster") {
	       		return 1;
	       } else {
	       		return 0;
	       }
	}
}

# When no run mode is specified, send an error
sub start
{
	GetError();
}
$modes{start} = \&start;

# send an xml stream to the output
sub GetError
{	
	$output ="";
}

# get the login information for the current session's user
sub GetLoginInfo
{
	# make the database query for the member's id
	my $query = $dbh->prepare("SELECT *
	                        FROM members
	                        WHERE member_wpiid = '$login'
	                        LIMIT 1");
	$query->execute;
	
	my @results=$query->fetchrow();
	
	$writer->xmlDecl();
	$writer->startTag('result', 'status' => 'login');
	
	GetMember($results[0]);
		
	$writer->endTag('result');
	$writer->end();
	
	return $output->value();
}
$modes{login} = \&GetLoginInfo;

# get the login information for the current session's user
sub GetMemberList
{
	my $filter = $page->param("filter");
	my $qry;
	
	use Switch;
	switch($filter) {
		case "officers" { $qry = "SELECT members.member_id 
                            FROM members, contacts 
                            WHERE members.member_contact = contacts.contact_id 
                               AND members.member_status < 9 
                            ORDER BY members.member_status" }
		case 'active' {	$qry = "SELECT members.member_id 
		                        FROM members, contacts 
		                        WHERE members.member_contact = contacts.contact_id 
		                             AND  < 10 
		                        ORDER BY contacts.contact_last" }
		case 'current' { $qry = "SELECT members.member_id 
		                         FROM members, contacts 
		                         WHERE members.member_contact = contacts.contact_id 
		                             AND  < 11 
		                         ORDER BY contacts.contact_last" }
		case 'alumni' { $qry = "SELECT members.member_id 
		                        FROM members, contacts 
		                        WHERE members.member_contact = contacts.contact_id 
		                             AND members.member_status = 11 
		                        ORDER BY contacts.contact_last" }
		else { $qry = "SELECT members.member_id 
		               FROM members, contacts 
		               WHERE members.member_contact = contacts.contact_id 
		               ORDER BY contacts.contact_last" }			
	}
	# make the database query for the member's id
	
	my $query = $dbh->prepare($qry);
	                           
	$query->execute;
	
	my @results;
	
	$writer->xmlDecl();
	$writer->startTag('result', 'status' => $filter);
	
	while(@results=$query->fetchrow()) {
		
		GetMember($results[0]);
		
	}
	
	$writer->endTag('result');
	$writer->end();
	
	return $output->value();
}
$modes{MemberList} = \&GetMemberList;


# get the login information for the current session's user
sub GetEventsCalendar
{
	my $start = $page->param("start");
	my $end = $page->param("end");
	
    
	my $query = $dbh->prepare("SELECT events.event_title,                events.event_setup, 
	                                  events.event_setup_duration,       events.event_start, 
	                                  events.event_start_duration,       events.event_strike,
	                                  events.event_strike_duration,      events.event_require_attendance,
	                                  types.type_title,                  types.type_abbrev,
	                                  locations.location_title
	                           FROM events, types, workorders, locations
	                           WHERE event_setup > '$start 00:00:00'
	                               AND event_setup < '$end 23:59:59'
	                               AND events.event_workorder = workorders.workorder_id
	                               AND events.event_location = locations.location_id
	                               AND types.type_id = workorders.workorder_type");
	                               
	$query->execute;
	
	$writer->xmlDecl();
	$writer->startTag('result', 'status' => $start."-to-".$end);
	
	my @results;
	
	while(@results=$query->fetchrow()) {
		$writer->startTag('event','type_long'=>$results[8],'type_short'=>$results[9],'location'=>$results[10]);
		
		$writer->startTag('title');
		$writer->characters($results[0]);
		$writer->endTag('title');
		
		$writer->startTag('setup', 'duration'=> $results[2]);
		$writer->characters($results[1]);
		$writer->endTag('setup');
		
		$writer->startTag('start', 'duration'=> $results[4]);
		$writer->characters($results[3]);
		$writer->endTag('start');

		$writer->startTag('strike', 'duration'=> $results[6]);
		$writer->characters($results[5]);
		$writer->endTag('strike');
		
		$writer->endTag('event');
	}
			
	$writer->endTag('result');
	$writer->end();
	
	return $output->value();
}
$modes{EventsCalendar} = \&GetEventsCalendar;


sub GetMember {
	my($memberID) = @_;
	
	my $query = $dbh->prepare("SELECT members.member_id, contacts.contact_first, 
	                        contacts.contact_last, contacts.contact_email, 
	                        contacts.contact_address, contacts.contact_phone, 
	                        members.member_year, members.member_join, 
	                        members.member_status, members.member_photo, 
	                        members.member_wpiid
	                        FROM members, contacts 
	                        WHERE (contacts.contact_id = members.member_contact) AND
	                              (members.member_id = '$memberID')
	                        LIMIT 1;");
	$query->execute;
	
	my @results=$query->fetchrow();
	
	$writer->startTag('member', 'id'=>$results[0], 'status'=>$results[8]);

	$writer->startTag('first');
	$writer->characters($results[1]);
	$writer->endTag('first');
	
	$writer->startTag('last');
	$writer->characters($results[2]);
	$writer->endTag('last');
		
	$writer->startTag('email');
	$writer->characters($results[3]);
	$writer->endTag('email');
		
	$writer->startTag('address');
	$writer->characters($results[4]);
	$writer->endTag('address');
		
	$writer->startTag('phone');
	$writer->characters($results[5]);
	$writer->endTag('phone');
		
	$writer->startTag('year');
	$writer->characters($results[6]);
	$writer->endTag('year');
		
	$writer->startTag('join');
	$writer->characters($results[7]);
	$writer->endTag('join');
		
	$writer->startTag('photo');
	$writer->characters($results[9]);
	$writer->endTag('photo');
	
	
	$writer->startTag('wpiid');
	$writer->characters($results[10]);
	$writer->endTag('wpiid');
	
	$writer->endTag('member');
}

1;
