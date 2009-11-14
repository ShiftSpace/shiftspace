<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>The ShiftSpace Manual</title>
    <link rel="stylesheet" href="manual.css" type="text/css" />
    <script src="mootools.js" type="text/javascript"></script>
    <script src="manual.js" type="text/javascript"></script>
  </head>
  <body>
    <div id="container">
      <div id="top">
        <a href="http://www.shiftspace.org/" id="logo"><img src="images/shiftspace_logo.png" class="noborder"/></a>
        <div id="tagline">an open source layer above any website</div>
      </div>
      <%include file="nav.html"/>
      <div id="main">
        ${self.content()}
      </div>
  </body>
</html>

<%def name="content()">
  <div id="main">
    Nothing to see here folks!
  </div>
</%def>
