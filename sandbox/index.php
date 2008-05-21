<?php

if (!empty($_GET['id'])) {
  require_once 'simple_proxy.php';
  exit;
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>ShiftSpace Sandbox</title>
    <script type="text/javascript" charset="utf-8">
      var ShiftSpaceSandBoxMode = true;
    </script>
    <script src="greasemonkey-api.js" type="text/javascript"></script>
    <script src="../shiftspace.php?method=shiftspace.user.js&sandbox=1" type="text/javascript" charset="utf-8"></script>
  </head>
  
  <body>
    <img src="logo.gif" alt="logo"></img>
    <img src="logos.png" alt="logos"></img>
  </body>
  
</html>
