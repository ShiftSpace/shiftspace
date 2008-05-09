<?php
/**********
USAGE:
simple_proxy.php?url=http://www.somesite.tld
***********/

function get_page($myurl)
{
  $curl = curl_init();
  curl_setopt($curl,CURLOPT_URL,$myurl);
  curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($curl,CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl,CURLOPT_COOKIE, 1);
  $result = curl_exec($curl);
  curl_close($curl);
  if(!$result){
    $result = "Page not found.";
    return "<p style=\"color:#DD6666;font-size:1em;font-family:Verdana,Helvetica,sans-serif;\">" .
      $result . "</p>";
  }
  //test if url begins with http:// if not add it
  if(!preg_match("/^http:\/\//",$myurl)){
  	$myurl = "http://" . $myurl;
  }
  //test wether url ends with a / if not add one
  if(!preg_match("/[a-zA-Z]+\/$/",$myurl)){
  	$myurl = $myurl . "/";
  }
  //get the base url
  preg_match("/^(http:\/\/)?([^\/]+)/i",$myurl, $matches);
  $baseurl = $matches[2];
  //replace relative links with absolute links
  //if beings with src="/
  $result = preg_replace("/src=\"\//i","src=\"$myurl" ,$result);
  //if begins with src="../
  $result = preg_replace("/src=\"\.\./i","src=\"$myurl.." ,$result);
  //if begins with src="word/ && word != http or www
  $result = preg_replace("/src=\"(?!http|www)/","src=\"$myurl",$result);
  //for href
  $result = preg_replace("/href=\"\//i","href=\"$myurl" ,$result);
  $result = preg_replace("/href=\"\.\./i","href=\"$myurl.." ,$result);
  //proxy links
  $result = preg_replace("/a href=\"/i","a href=\"simple_proxy.php?url=", $result);
  //fix css imports
  $result = preg_replace("/@import\s+\"\//","@import \"http://$baseurl/", $result);
  //fix css for for href=\"/css/essay.css
  $result = preg_replace("/href=\\\"\//","href=\\\"$myurl", $result);
  //remove 'most' javascript
  //$result = preg_replace("/\<script.+\<\/script>/im","<!--removedjavascript-->",$result);
  //insert ShiftSpace
  /*
  $ShiftSpace = '<script type="text/javascript" charset="utf-8">
      var ShiftSpaceSandBoxMode = true;
    </script>
    <script src="greasemonkey-api.js" type="text/javascript"></script>
    <script src="../shiftspace.php?method=shiftspace.user.js&sandbox=1" type="text/javascript" charset="utf-8"></script>';
  */
  
  // load styles
  $ShiftSpace = '<link type="text/css" rel="stylesheet"" href="../styles/ShiftSpace.css"></link>';

  // Bootstrap
  $ShiftSpace .= '<script type="text/javascript">var ShiftSpace = {};</script>';
  $ShiftSpace .= '<script type="text/javascript" src="../client/MooTools.js"></script>';
  $ShiftSpace .= '<script type="text/javascript" src="greasemonkey-api.js"></script>';
  $ShiftSpace .= '<script type="text/javascript" src="bootstrap.js"></script>';
  $ShiftSpace .= '<script type="text/javascript" src="../client/Pin.js"></script>';
  $ShiftSpace .= '<script type="text/javascript" src="../client/Element.js"></script>';
  $ShiftSpace .= '<script type="text/javascript" src="../client/Space.js" charset="utf-8"></script>';
  $ShiftSpace .= '<script type="text/javascript" src="../client/Shift.js" charset="utf-8"></script>';
  $ShiftSpace .= '<script type="text/javascript" src="../spaces/Notes/Notes.js" charset="utf-8"></script>';
  
  // show a shift
  $ShiftSpace .= "<script type='text/javascript' charset='utf-8'>
    window.addEvent('domready', function() {
      Notes.showShift({
        id: 'test',
        summary: 'hello',
        noteText: 'badass',
        position: {x:100, y:100},
        size: {width:200, y:200},
        pinRef: null
      });
    });
  </script>";

  $result = preg_replace("/<\/head>/",$ShiftSpace . "</head>", $result);
  return $result;
}

$page = array_key_exists('url', $_GET)? $_GET['url'] : "";
$space = array_key_exists('space', $_GET)? $_GET['space'] : "";
$shiftId = array_key_exists('shiftId', $_GET)? $_GET['shiftId'] : "";

$processedPage = get_page($page);
print $processedPage;
?>