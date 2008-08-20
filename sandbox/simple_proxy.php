<?php
/*

"If all of this works it will be like del.icio.us on crack!"
-- David

*/

$dir = dirname(__FILE__) . '/..';
require_once '../server/database/database.php';
require_once '../server/config.php';
$db = new Database($db_path);
$id = $db->escape($_GET['id']);

// If more than one id was passed, parse them out
$shift_ids = array ();
if(preg_match("/,/",$id)){
  $shift_ids = split(',', $id);
  $id = $shift_ids[0];
}

$shift = $db->row("
  SELECT *
  FROM shift
  WHERE url_slug = '$id'
");

$myurl = $shift->href;

$curl = curl_init();
curl_setopt($curl,CURLOPT_URL,$myurl);
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($curl,CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl,CURLOPT_COOKIE, 1);
$result = curl_exec($curl);
curl_close($curl);
if(!$result){
  $result = "Page not found.";
  echo "<p style=\"color:#DD6666;font-size:1em;font-family:Verdana,Helvetica,sans-serif;\">" .
    $result . "</p>";
  exit;
}
//test if url begins with http:// if not add it
if(!preg_match("/^http:\/\//",$myurl)){
  $myurl = "http://" . $myurl;
}
//test wether url ends with a / if not add one
if(!preg_match("/[a-zA-Z]+\/$/",$myurl)){
  $myurl = $myurl . "/";
}
// get the base url
preg_match("/^(http:\/\/)?([^\/]+)/i",$myurl, $matches);
$baseurl = $matches[2];
// replace relative links with absolute links
// if beings with src="/
$result = preg_replace("/src=\"\//i","src=\"http://$baseurl/" ,$result);
// if begins with src="../
$result = preg_replace("/src=\"\.\./i","src=\"$myurl" ,$result);
// if begins with src="word/ && word != http or www
$result = preg_replace("/src=\"(?!http|www)/","src=\"$myurl",$result);
// href=/
$result = preg_replace("/href=\"\//i","href=\"http://$baseurl/" ,$result);
// href="folder/file
$result = preg_replace("/href=\"(?=[^http|www|.+\..+\/])/","href=\"http://$baseurl/",$result);
// href=".. will fix if .. is root
$result = preg_replace("/href=\"\.\./i","href=\"$myurl" ,$result);
// css imports
$result = preg_replace("/@import\s+url(\//","@import url(http://$baseurl/", $result);
$result = preg_replace("/@import\s+url([^\/]/","@import url(http://$myurl/", $result);
// css for for href=\"/css/essay.css
$result = preg_replace("/href=\"?\//","href=\"$myurl", $result);

// remove 'most' javascript
$result = preg_replace("/<script.*?<\/script>/ims","<!--removedjavascript-->",$result);
$result = preg_replace("/onresize=\".+\"/","",$result);
$result = preg_replace("/onload=\".+\"/","",$result);
$result = preg_replace("/onresize=\'.+\'/","",$result);
$result = preg_replace("/onload=\'.+\'/","",$result);
// insert ShiftSpace
/*
$ShiftSpace = '<script type="text/javascript" charset="utf-8">
    var ShiftSpaceSandBoxMode = true;
  </script>
  <script src="greasemonkey-api.js" type="text/javascript"></script>
  <script src="../shiftspace.php?method=shiftspace.user.js&sandbox=1" type="text/javascript" charset="utf-8"></script>';
*/

// load styles
$ShiftSpace = '<link type="text/css" rel="stylesheet"" href="../styles/ShiftSpace.css"></link>';
$ShiftSpace .= '<link type="text/css" rel="stylesheet"" href="../styles/SSProxyMessage.css"></link>';

// Bootstrap
$server = $_SERVER['HTTP_HOST'];
$ssdir = dirname($_SERVER['PHP_SELF']);

// prevent console.logs from breaking proxy
$ShiftSpace .= '<script type="text/javascript">
  if(!window.console)
  {
    window.console = {
      log: function() {},
      error: function() {}
    };
  }
</script>';

$ShiftSpace .= '<script type="text/javascript">
  var __ssdir__ = "'.$ssdir.'".split("/");
  var __server__ = "http://'.$server.'"+__ssdir__.slice(0, __ssdir__.length-1).join("/")+"/";
</script>';

$ShiftSpace .= '<script type="text/javascript" src="../client/Mootools.js"></script>';
$ShiftSpace .= '<script type="text/javascript" src="SSProxyMessage.js"></script>';
$ShiftSpace .= '<script type="text/javascript" src="greasemonkey-api.js"></script>';

$ShiftSpace .= '<script type="text/javascript">var ShiftSpace = {
  info: function()
  {
    return {
      server: __server__
    };
  },
  xmlhttpRequest: GM_xmlhttpRequest
};</script>';

$ShiftSpace .= '<script type="text/javascript" src="bootstrap.js"></script>';
$ShiftSpace .= '<script type="text/javascript" src="../client/Pin.js"></script>';
$ShiftSpace .= '<script type="text/javascript" src="../client/RangeCoder.js"></script>';
$ShiftSpace .= '<script type="text/javascript" src="../client/Element.js"></script>';
$ShiftSpace .= '<script type="text/javascript" src="../client/Space.js" charset="utf-8"></script>';
$ShiftSpace .= '<script type="text/javascript" src="../client/Shift.js" charset="utf-8"></script>';

// Build shift_ids array if it wasn't already parsed from id param
if (!count($shift_ids) && !empty($_GET['all_shifts'])) {
  $shifts = $db->rows("
      SELECT url_slug
      FROM shift
      WHERE status = 1
      AND href = '$shift->href'
  ");
  foreach ($shifts as $n => $ashift) {
    foreach ($ashift as $key => $val) {
      $shift_ids[] = $val;
    }
  }
} else {
  $shift_ids[] = $id;
}

// for single shifts on the proxy
$cshift;
$spaceName;
$userName;
$shifthref;
// Load each requested shift
foreach ($shift_ids as $an_id)
{
    // grab the shift
    $shift = $db->row("
      SELECT *
      FROM shift
      WHERE url_slug = '$an_id'
    ");
    
    $cshift = $shift;

    $spaceName = $shift->space;
    $shifthref = $shift->href;
    
    // grab the user name
    $user_id = $shift->user_id;
    $userName = $db->value("
      SELECT username
      FROM user
      where id=$user_id
    ");
    
    $legacy = true;
    if($spaceName == 'notes') 
    {
      $spaceName = 'Notes';
    }
    else if($spaceName == 'highlight') 
    {
      $spaceName = 'Highlights';
    }
    else if($spaceName == 'imageswap')
    {
      $spaceName = 'ImageSwap';
    }
    else if($spaceName == 'sourceshift')
    {
      $spaceName = 'SourceShift';
    }
    else
    {
      $legacy = false;
    }

    $shiftContent = $shift->content;

    // Escape \n (common in ranges) so they don't break parsing when
    // embedded in javascript (empirically, replacing \r caused problems)
    $shiftContent = str_replace("\n", "\\n", $shift->content);

    $shiftId = $shift->url_slug;

    // TODO: this should be replaced by versioning - David
    if($legacy)
    {
      // remove the curly braces
      $shiftContent = substr($shiftContent, 1, strlen($shiftContent)-2);
    }

    $legacyValue = ($legacy) ? 'true' : 'false';

    // check the database for the shift's space load
    $ShiftSpace .= '<script type="text/javascript" src="../spaces/'.$spaceName.'/'.$spaceName.'.js" charset="utf-8"></script>';

    // get the shift out of the database
    $ShiftSpace .= "<script type='text/javascript' charset='utf-8'>
      window.addEvent('domready', function() {
	var theShift = $shiftContent;
	
	if($legacyValue)
	{
	  theShift = \$merge(theShift, {legacy:true});
	}
	theShift = \$merge(theShift, {id:'$shiftId'});

  $spaceName.setCssLoaded(true);
	$spaceName.showShift(theShift);
	$spaceName.orderFront('$shiftId');
      });
    </script>";
}

$result = preg_replace("/<\/head>/",$ShiftSpace . "</head>", $result);

$proxymessage = "<div id='SSProxyMessage' class='ShiftSpaceElement'>
	<div id='SSProxyMessageLeft'>
		<a href='http://www.shiftspace.org/' id='SSProxyMessageLogo' title='visit www.shiftspace.org'></a>
		<a href='http://www.shiftspace.org/spaces/$spaceName/' id='SSProxyMessageSpace' title='more about this ShiftSpace feature'>
			<img src='../spaces/$spaceName/$spaceName.png' alt='$spaceName icon'/>
		</a>
		<div id='SSProxyMessagedescription'>
			This is a representation of a page shifted <span class='SSProxyMessageDate'>3 days ago</a> by ShiftSpace user, <b>$userName</b>, using the <b>$spaceName</b> feature
			<a href ='http://www.shiftspace.org/'>learn more</a>
		</div>
	</div>
	<a href='$shifthref' title='View the original page' id='SSProxyMessageVisit'>
		view original page
	</a>";
	
$result = preg_replace("/<\/html>/", $proxymessage."</html>", $result);

echo $result;

?>
