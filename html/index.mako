<!-- Start status output -->
<%def name="status(type)">
   % if type == "err": 
   <div class="error">Uh oh!</div>
   % elif type == "warn":
   <div class="error">Almost there</div>
   % elif type == "noerr":
   <div class="good">Hey, looking good</div>
   % endif
</%def>
<!-- End status output -->

<!-- Start details output -->
<%def name="details(type)">
   % if type == "couchdb":
   <div>
       <p>Could not connect to CouchDB. Make sure it is up and running <a target="new" href="http://localhost:5984/">here</a>.</p>
   </div>
   % elif type == "initdb":
   <div>
       <p>Your database has not been initialized. Using a terminal, run the following commands from your ShiftSpace directory:</p>
       <pre>$ python shifty.py initdb</pre>
       <p>To learn more about shifty.py please refer to the <a target="new" href="manual/">documentation</a>.</p>
   </div>
   % elif type == "noerr":
   <p class="accept">Everything appears to be running smoothly.</p>
   <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,28,0" width="600" height="299" title="Awesome">
       <param name="movie" value="images/status/awesome.swf" />
       <param name="quality" value="high" />
       <param name="wmode" value="transparent" />
       <embed src="images/status/awesome.swf" quality="high" pluginspage="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash" type="application/x-shockwave-flash" width="600" height="299" wmode="transparent"></embed>
   </object>
   <div class="info">
       For information on how to extend ShiftSpace go <a target="new" href="manual/">here</a>. You can hack on ShiftSpace <a target="new" href="sandbox/">here</a>. You can find the complete documentation <a target="new" href="docs/">here</a>.
   </div> 
   % endif
</%def>
<!-- End details output -->

<!-- Start the actual page -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>ShiftSpace ${version}</title>
    <link rel="stylesheet" href="styles/status.css" type="text/css" />
    <script src="Scripts/AC_RunActiveContent.js" type="text/javascript"></script>
</head>
<body>
    <div id="main">
        <h1>ShiftSpace ${version}</h1>
        <h2>${status(statusType)}</h2>
        <div id="details">${details(detailsType)}</div>
    </div>
</body>
</html>
<!-- End the actual page -->
