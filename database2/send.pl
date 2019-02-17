#!/usr/bin/perl

use DBI;

print "Content-type: text/xml \n\n";

%incoming = &read_input;

if(length($incoming{'filter'}) > 0) {
	
	$dbh = DBI->connect("DBI:mysql:bobtest:mysql.wpi.edu","rbreznak",'oHcCBM');
	
	use Switch;
	
	switch($incoming{'filter'}) {
		case "addmember" { getAddMember() } 
	}
	
	$dbh->disconnect;
	
} else {
	print "<error result=\"error\" type=\"invalid filter\"></error>";
}

exit;

sub read_input
{
    local ($buffer, @pairs, $pair, $name, $value, %FORM);
    # Read in text
    $ENV{'REQUEST_METHOD'} =~ tr/a-z/A-Z/;
    if ($ENV{'REQUEST_METHOD'} eq "POST")
    {
	read(STDIN, $buffer, $ENV{'CONTENT_LENGTH'});
    } else {
	$buffer = $ENV{'QUERY_STRING'};
    }
    # Split information into name/value pairs
    @pairs = split(/&/, $buffer);
    foreach $pair (@pairs)
    {
	($name, $value) = split(/=/, $pair);
	$value =~ tr/+/ /;
	$value =~ s/%(..)/pack("C", hex($1))/eg;
	$FORM{$name} = $value;
    }
    %FORM;
}

sub getError() {
	print "<error result=\"error\" type=\"error\"></error>";
	die();
}

sub getAddMember() {

	$first  = $incoming{'first'};
	$last  = $incoming{'last'};
	$email = $incoming{'email'};
	$year  = $incoming{'year'};
	$join  = $incoming{'join'};
	$photo  = $incoming{'photo'};
	$wpiid  = $incoming{'wpiid'};
	$address  = $incoming{'address'};
	$phone = $incoming{'phone'};

	$query2 = $dbh->prepare("INSERT INTO `members` (`member_first`,`member_last`,`member_email`,`member_year`,`member_join`,`member_photo`,`member_wpiid`,`member_address`,`member_phone`, `member_status`) VALUES 
	                                               ('$first',      '$last',      '$email',      '$year',      '$join',      '$photo',      '$wpiid',      '$address',      '$phone', '9')");

	$query2->execute or getError();

	print "<test result=\"added\">Added Member $first $last : $email : $wpiid</test>";

}