<?php
/*

"If all of this works it will be like del.icio.us on crack!"
-- David

*/

// TODO: Redundant should import this from main.php - David
function elapsed_time($date) {
  $date = strtotime($date);
  $now = time();
  if ($now - $date < 60) {
    return ($now - $date) . ' seconds ago';
  } else if (($now - $date) < 120) {
    return 'about a minute ago';
  } else if (($now - $date) < 60 * 60) {
    $mins = round(($now - $date) / 60);
    return "$mins minutes ago";
  } else if (($now - $date) < 60 * 60 * 2) {
    return 'about an hour ago';
  } else if (($now - $date) < 60 * 60 * 24) {
    $hours = round(($now - $date) / 3600);
    return "$hours hours ago";
  } else if (($now - $date) < 60 * 60 * 24 * 2) {
    return 'yesterday';
  } else {
    return date('M j, Y', $date);
  }
}

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
$useragent = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.0.1) Gecko/2008070206 Firefox/3.0.1";
curl_setopt($curl,CURLOPT_USERAGENT,$useragent);
$result = curl_exec($curl);
curl_close($curl);
if(!$result){
  $result = "Page not found.";
  echo "<p style=\"color:#DD6666;font-size:1em;font-family:Verdana,Helvetica,sans-serif;\">" .
    $result . "</p>";
  exit;
}

$lp = new LinkProcessor();
$lp->setUrl($myurl);
$lp->setDoc($result);
$result = $lp->getProcessedDoc();

// load styles
$ShiftSpace = "<link type=\"text/css\" rel=\"stylesheet\" href=\"$base_url../styles/ShiftSpace.css\" />\n";
$ShiftSpace .= "<link type=\"text/css\" rel=\"stylesheet\" href=\"$base_url../styles/SSProxyMessage.css\" />";

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

$ShiftSpace .= "<script type=\"text/javascript\" src=\"$base_url../client/Mootools.js\"></script>\n";
$ShiftSpace .= "<script type=\"text/javascript\" src=\"{$base_url}SSProxyMessage.js\"></script>\n";
$ShiftSpace .= "<script type=\"text/javascript\" src=\"{$base_url}greasemonkey-api.js\"></script>\n";

$ShiftSpace .= '<script type="text/javascript">var ShiftSpace = {
  info: function()
  {
    return {
      server: __server__
    };
  },
  xmlhttpRequest: GM_xmlhttpRequest
};</script>';

$ShiftSpace .= "<script type=\"text/javascript\" src=\"{$base_url}bootstrap.js\"></script>\n";
$ShiftSpace .= "<script type=\"text/javascript\" src=\"$base_url../client/Pin.js\"></script>\n";
$ShiftSpace .= "<script type=\"text/javascript\" src=\"$base_url../client/RangeCoder.js\"></script>\n";
$ShiftSpace .= "<script type=\"text/javascript\" src=\"$base_url../client/Element.js\"></script>\n";
$ShiftSpace .= "<script type=\"text/javascript\" src=\"$base_url../client/Space.js\"></script>\n";
$ShiftSpace .= "<script type=\"text/javascript\" src=\"$base_url../client/Shift.js\"></script>\n";

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
    
    $date = ucfirst(elapsed_time($shift->created));
    
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
    $ShiftSpace .= '<script type="text/javascript" src="'.$base_url.'../spaces/'.$spaceName.'/'.$spaceName.'.js" charset="utf-8"></script>';

    // get the shift out of the database
    $ShiftSpace .= "<script type='text/javascript' charset='utf-8'>
      window.addEvent('domready', function() {
	var theShift = Json.evaluate(unescape($shiftContent));
	
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

$result = preg_replace("/<\/head>/i",$ShiftSpace . "</head>", $result);

$proxymessage = "<div id='SSProxyMessage' class='ShiftSpaceElement'>
	<div id='SSProxyMessageLeft'>
		<a href='http://www.shiftspace.org/' id='SSProxyMessageLogo' title='visit www.shiftspace.org'></a>
		<a href='http://www.shiftspace.org/spaces/$spaceName/' id='SSProxyMessageSpace' title='more about this ShiftSpace feature'>
			<img src='$base_url../spaces/$spaceName/$spaceName.png' alt='$spaceName icon'/>
		</a>
		<div id='SSProxyMessagedescription'>
			This is a representation of a page shifted <span class='SSProxyMessageDate'>$date</a> by ShiftSpace user, <b>$userName</b>, using the <b>$spaceName</b> feature
			<a href ='http://www.shiftspace.org/'>learn more</a>
		</div>
	</div>
	<a href='$shifthref' title='View the original page' id='SSProxyMessageVisit'>
		view original page
	</a>";
	
$result = preg_replace("/<\/html>/i", $proxymessage."</html>", $result);

echo $result;

?>
