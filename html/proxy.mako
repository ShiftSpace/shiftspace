<!-- Start the actual page -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>ShiftSpace Proxy</title>
    <link rel="stylesheet" href="/styles/proxy.css" type="text/css" />
    <link rel="stylesheet" href="/styles/ShiftSpace.css" type="text/css" />
    <script src="/externals/mootools-1.2.3-core.js" type="text/javascript"></script>
    <script src="/externals/mootools-1.2.3.1-more.js" type="text/javascript"></script>
    <script src="/builds/shiftspace.sandbox.js" type="text/javascript"></script>
    <script id="SSOuterChannel" type="text/javascript">
        window.addEvent("domready", function() {
          window.addEventListener("message", function(evt) {
            if(evt.origin !== "http://127.0.0.1:8080")
            {
              console.log("Message from unexpected origin");
            }
            else
            {
              console.log("Message", evt);
            }
          }, false);
        });
        function sendMessage(msg) {
          $("unsafe-frame").contentWindow.postMessage(JSON.encode(msg), "http://127.0.0.1:8080${src}");
        }
    </script>
</head>
<body>
    <iframe id="unsafe-frame" src="http://127.0.0.1:8080${src}">
    </iframe>
    <div id="mask"></div>
</body>
</html>
<!-- End the actual page -->
