<%def name="include_textile(filename)">
  <%
  import textile
  fh = open(filename)
  result = textile.textile(fh.read())
  fh.close()
  %>
  ${result}
</%def>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="Refresh" content="0; install"/>
    <title>The ShiftSpace Manual</title>
  </head>
  <body>
    <%include file="nav.html"/>
    ${self.content()}
  </body>
</html>

<%def name="content()">
  <div id="main">
    Nothing to see here folks!
  </div>
</%def>
