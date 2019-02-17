package LnLDB2;
use base 'CGI::Application';
use strict;
use Time::Seconds;
use Date::Parse;
use PDF::API2;

sub pdf_workorder
{
	my $self = shift;
	my @id = $query->param('Events');

	# Create the pdf object, with the two fonts, and letter size pages.
	my $pdf = PDF::API2->new;
	$pdf->corefont('Helvetica');
	$pdf->corefont('Helvetica-Bold');

	foreach my $id (@id)
	{
		$self->generate_event_workorder($id, $pdf);
	}

	my $output = $pdf->stringify();
	$pdf->end;

	$self->header_props(-type=>'application/pdf',
			-Content_length=>length($output));

	return $output;
}

sub draw_text_center
{
	my ($text, $string) = @_;

	my $dist = $text->advancewidth($string) / 2;

	$text->distance(-$dist, 0);
	$text->text($string);
	$text->distance( $dist, 0);
}

sub generate_event_workorder
{
	my ($self, $id, $pdf) = @_;
    
	$data[0] = "";
	$data[1] = "";
	$data[2] = "";
	$data[3] = "";
	$data[4] = "";
	$data[5] = "";
	$data[6] = "";
	$data[7] = "";
	$data[8] = "";
	$data[9] = "";
	$data[10] = "";
	$data[11] = "";
	$data[12] = "";
	$data[13] = "";
	$data[14] = "";
	$data[15] = "";
	$data[16] = "";
	$data[17] = "";
	$data[18] = "";
	$data[19] = "";
	$data[20] = "";
	$data[21] = "";
	$data[22] = "";
	$data[23] = "";
	$data[24] = "";
	$data[25] = "";
	$data[26] = "";
	$data[27] = "";
	$data[28] = "";
	$data[29] = "";
	
	# Use 'same' for undefined dates
	$data[4] = 'same' unless defined $data[4];
	$data[5] = 'same' unless defined $data[5];

	my $xl    =  20; # Left text margin
	my $xcc   = 200; # Line between crew and cc report
	my $xc    = 306; # Column 2 start
	my $xr    = 592; # Right text margin
	my $yt    = 770; # Top margin
	my $yb    =  20; # Bottom margin

	my $large =  30; # Large text height
	my $med   =  12; # Medium text height
	my $small =  10; # Small text height

	# Current y location
	my $y = $yt - $large;

	my $page = $pdf->page;
	my $text = $page->text;

	# Add initials section
	$text->font($pdf->corefont('Helvetica'), $small);
	$text->lead($small);
	$text->distance($xr - 35, $yt);
	$text->text("Conf $data[22]");  $text->nl();
	$text->text("Est   $data[21]"); $text->nl();
	$text->text("Rate");            $text->nl();
	$text->text("Bill");            $text->nl();
	$text->text("Hrs");
	$text->distance(-$xr + 35, -$yt + $small * 4);

	# Draw top title
	$text->font($pdf->corefont('Helvetica'), $large);
	$text->distance($xc, $y);
	draw_text_center($text, "WPI Lens and Lights Work Order");

	# Draw secondary title
	$y -= $small * 1.75;
	$text->font($pdf->corefont('Helvetica'), $small);
	$text->distance(0, $small * -1.75);
	draw_text_center($text, "Student Activities Office - WPI - 100 Institute Road - Worcester, MA - 01609-2280");

	$y -= $small * 1.125;
	$text->distance(0, $small * -1.125);
	draw_text_center($text, "508-831-5595 - Fax: 508-831-6045 - lnl\@wpi.edu - http://lnl.wpi.edu/");

	$y -= $small;
	$text->distance(0, -$small);

	my $gfx = $page->gfx();
	$gfx->move($xr - 40, $yt + $small);
	$gfx->line($xr - 40, $yt - $small * 4.25);
	$gfx->line(602,      $yt - $small * 4.25);
	$gfx->stroke();

	# Draw top separator
	$gfx->linewidth(2.0);
	$gfx->move(10, $y); $gfx->line(602, $y); $gfx->stroke();

	# Remember y for vertical separator
	my $sep = $y;

	$y -= $med + 5;

	# Set up the bold text block
	$text->font($pdf->corefont('Helvetica-Bold'), $med);

	# Draw titles
	$text->distance(0, -$med - 5);
	$text->text("Billing Information");
	$text->distance($xl - $xc, 0);
	$text->text("Event Contact");

	# Set up the regular text block
	$text->font($pdf->corefont('Helvetica'), $med);

	# Add the contact and billing information
	$y -= $med * 1.125;
	$text->distance(0, $med * -1.125);
	$text->text($data[11]);
	$text->distance($xc - $xl, 0);
	$text->text($data[16]);

	$data[17] =~ s/\n/ /g;

	$y -= $med * 1.125;
	$text->distance($xl - $xc, $med * -1.125);
	$text->text($data[12]);
	$text->distance($xc - $xl, 0);
	$text->text($data[17]);

	$data[13] =~ s/\n/ /g;

	$y -= $med * 1.125;
	$text->distance($xl - $xc, $med * -1.125);
	$text->text($data[13]);
	$text->distance($xc - $xl, 0);
	$text->text($data[18]);

	$y -= $med * 1.125;
	$text->distance($xl - $xc, $med * -1.125);
	$text->text($data[14]);
	$text->distance($xc - $xl, 0);
	$text->text($data[19]);

	$y -= $med * 1.125;
	$text->distance($xl - $xc, $med * -1.125);
	$text->text($data[15]);
	$text->distance($xc - $xl, 0);
	$text->text($data[20]);

	$y -= $med * 1.125;

	# Draw the vertical separator
	$gfx->move($xc - 10, $sep); $gfx->line($xc - 10, $y);

	# Draw the horizontal separator
	$gfx->move(10, $y); $gfx->line(602, $y); $gfx->stroke();
	$sep = $y;

	$y -= $med + 5;

	# Remember the current location for drawing later
	my $ytemp = $y;

	# Change to bold
	$text->font($pdf->corefont('Helvetica-Bold'), $med);

	$text->distance($xl - $xc, $med * -2.125 - 5);

	# Draw the name, location, type, date, and time titles
	foreach ("Event Name", "Location", "Event Type", "Setup Date",
	     "Start Date", "End Date", "Setup Time", "Start Time",
	     "End Time")
	{
		$text->text($_); $y -= $med * 1.125; $text->distance(0, $med * -1.125);
	}

	# Change back to regular
	my $font = $pdf->corefont('Helvetica');
	$text->font($font, $med);

	# Draw name, location, type, dates, and times
	my $width = 75;
	my $width2 = 0;

	$text->distance($width, $ytemp - $y);
	$y = $ytemp;

	foreach (@data[0..8])
	{
		my $w = $font->width($_);
		$width2 = $w if $w > $width2;
		$text->text($_); $y -= $med * 1.125; $text->distance(0, $med * -1.125);
	}

	$width2 *= $med;

	my $yinfo = $y;

	my $xcur = $xl + $width + $width2 + 20;
	$text->distance($width2 + 20, $ytemp - $y);
	$y = $ytemp;

	# Change to bold
	$text->font($pdf->corefont('Helvetica-Bold'), $med);

	# Draw requirements title
	$text->text("Requirements");

	$y -= $med * 1.125;
	$text->distance(0, $med * -1.125);

	# Change back to regular
	$text->font($pdf->corefont('Helvetica'), $med);

	# Draw requirements
	$data[9] =~ s/\s\s+/ /g;
	$data[9] =~ s/^\s//;
	$data[9] =~ s/\s$//;
	my($xe, $ye) = $text->paragraph($data[9], -x => $xcur, -y => $y,
				    -w => $xr - $xcur, -h => $y,
				    -lead => -$med);

	$text->distance(0, $med * -1.125);

	if(defined $data[10])
	{
		$data[10] =~ s/^\s+//;
		$data[10] =~ s/\s\s+/ /g;
		$data[10] =~ s/ +$//;

		if(length($data[10]))
		{
			$y = $ye;

			# Change to bold
			$text->font($pdf->corefont('Helvetica-Bold'), $med);

			# Draw notes title
			$text->text("Special Instructions");

			$y -= $med * 1.125;

			# Change back to regular
			$text->font($pdf->corefont('Helvetica'), $med);

			# Draw notes
			($xe, $ye) = $text->paragraph($data[10], -x => $xcur, -y => $y,
						  -w => $xr - $xcur, -h => $y,
						  -lead => -$med);

			$text->distance(0, $med * -1.125);
		}
	}

	$y = $ye;

	if($yinfo < $y)
	{
		$text->distance(0, $yinfo - $y);
		$y = $yinfo;
	}

	# Draw the vertical separator
	$gfx->move($xcur - 10, $sep); $gfx->line($xcur - 10, $y);

	# Draw the separator
	$gfx->move(10, $y); $gfx->line(602, $y);

	# Draw separator between crew and report
	$gfx->move($xcc, $y); $gfx->line($xcc, 10); $gfx->stroke();

	# Remember current y for cc report lines
	my $yrep = $y;

	# Spacing for handwritten forms
	my $spacing = 36;

	$y -= $spacing;
	$text->distance($xl - $xcur, -$spacing);

	# Switch to thin lines
	$gfx->linewidth(1.0);

	# Draw the setup info line
	$text->text("Setup");

	$gfx->move($xl + 35, $y); $gfx->line($xcc - 10, $y); $gfx->stroke();

	# Draw the fill-in section for CC and crew
	$y -= $spacing;
	$text->distance(0, -$spacing);

	$text->text("CC");

	$gfx->move($xl + 20, $y);
	$gfx->line($xcc - 30, $y);
	$gfx->move($xcc - 26, $y);
	$gfx->line($xcc - 10, $y);

	while ($y > 10 + $spacing)
	{
	$y -= $spacing;
	$text->distance(0, -$spacing);
	$gfx->move($xl, $y);
	$gfx->line($xcc - 30, $y);
	$gfx->move($xcc - 26, $y);
	$gfx->line($xcc - 10, $y);
	}

	$gfx->stroke();

	# Draw the CC report
	$text->distance($xcc + 10 - $xl, $yrep - $med - 5 - $y);
	$y = $yrep - $med - 5;
	$text->text("CC Report");

	$gfx->strokecolor(0.75);

	while($y > 10 + $med + $spacing)
	{
	$y -= $spacing;
	$text->distance(0, -$spacing);
	$gfx->move($xcc + 10, $y); $gfx->line($xr, $y);
	}

	$gfx->stroke();

	# Add the line for the crew chief signature
	$gfx->strokecolor(0);
	$text->distance($xc - $xcc - 10, $yb - $y);
	$text->text("CC Signature");
	$gfx->move($xc + 80, $yb); $gfx->line($xr, $yb); $gfx->stroke();
}

$modes{pdf_workorder} = \&pdf_workorder;

1;
