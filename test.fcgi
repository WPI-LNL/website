#!/usr/bin/perl

use FCGI;

$cnt = 0;

while (FCGI::accept() >= 0)
{
   print ("Content-type: text/html\r\n\r\n");
   print ("<head>\n<title>FastCGI Demo Page (perl)</title>\n</head>\n");
   print  ("<h1>FastCGI Demo Page (perl)</h1>\n");
   print ("This is coming from a FastCGI server.\n
\n");
   print ("Running on <EM>$ENV{USER}</EM> to <EM>$ENV{REMOTE_HOST}</EM>\n
\n");
    $cnt++;
   print ("This is connection number $cnt\n");
}
