<?php

$readme = '<p>If you want more detailed instructions, take a look at the enclosed <a href="readme.txt">readme</a> file. If you need more help, you can always send an email to the <a href="http://googlegroups.com/group/shiftspace">ShiftSpace discussion list</a>.';

@include "$dir/server/config.php";

if (substr($db_path, 0, 9) == 'sqlite://') {
  $db_filename = substr($db_path, 9);
}

if (!file_exists("$dir/server/config.php")) {
  $status = "Uh oh!";
  $details = "<p class=\"error\">Looks like you're missing your config.php file! You may want to reinstall ShiftSpace.</p>$readme";
} else if (!empty($db_filename) && !file_exists($db_filename) &&
           !is_writable(dirname($db_filename))) {
    $db_dir = realpath(dirname($db_filename));
    $status = "You're almost done installing!";
    $details = "<div class=\"error\"><p>You just need to loosen the file permissions on your ShiftSpace directory so that PHP can create the SQLite database file. Here is the terminal command to use in Mac OS X or other Unix-like systems:</p>
<pre>cd $db_dir
chmod 777 .</pre>
   <p>Once you do that, reload this page and your database file will automatically be created and initialized.</p></div><p class=\"info\">Placing your database file in a world-writable directory may be a bad idea for security reasons, especially when it's being shared through a web server. You may want to consider moving the file to a non-public directory and tightening up the file permissions. The only constraint is that the directory be writable by web server's user. Just edit the file config.php to change where the database lives.</p>$readme";
} else if (!empty($db_filename) && !file_exists($db_filename)) {
    require_once 'setup.php';
    if (empty($db) || $db->tables() == array()) {
        $status = "Hmm ... that's odd.";
        $details = "<p class=\"error\">For some reason the database could not be initialized. It could be that you're using XAMPP, which is currently not working with the database library.</p>$readme";
    }
}
if (empty($status)) {
    $status = 'Hey, looking good!';
    $details = "<p class=\"accept\">Everything appears to be running smoothly.</p>
	<object classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" codebase=\"http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,28,0\" width=\"600\" height=\"299\" title=\"Awesome\">
      <param name=\"movie\" value=\"images/status/awesome.swf\" />
      <param name=\"quality\" value=\"high\" />
      <param name=\"wmode\" value=\"transparent\" />
      <embed src=\"images/status/awesome.swf\" quality=\"high\" pluginspage=\"http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash\" type=\"application/x-shockwave-flash\" width=\"600\" height=\"299\" wmode=\"transparent\"></embed>
    </object>
	<div class=\"info\">To begin, install <a href=\"https://addons.mozilla.org/firefox/748/\">Greasemonkey</a> and then the <a href=\"?version=0.5&method=shiftspace.user.js\">userscript</a>.</div>";
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>ShiftSpace <?php echo $version; ?></title>
    <link rel="stylesheet" href="styles/status.css" type="text/css" />
    <script src="Scripts/AC_RunActiveContent.js" type="text/javascript"></script>
</head>
<body>
    <div id="main">
        <h1>ShiftSpace <?php echo $version; ?></h1>
        <h2><?php echo $status; ?></h2>
        <div id="details"><?php echo $details; ?></div>
    </div>
</body>
</html>
