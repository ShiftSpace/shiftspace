<link type="text/css" rel="stylesheet" href="/styles/ShiftSpace.css"></link>
<link type="text/css" rel="stylesheet" href="/styles/SSProxyMessage.css"></link>
<script type="text/javascript">
  if(!window.console) {
    window.console = {
      log: function() {},
      error: function() {}
    };
  }
</script>
<script type="text/javascript" src="/client/sys/SSLog.js"></script>
<script type="text/javascript">
  var __server = "${server}";
  var __spacesDir = "${spacesDir}";
</script>
<script type="text/javascript" src="/externals/mootools-1.2.3-core.js"></script>
<script type="text/javascript" src="/externals/mootools-1.2.3-more.js"></script>
<script type="text/javascript" src="/sandbox/SSProxyMessage.js"></script>
<script type="text/javascript" src="/client/sys/GreaseMonkeyApi.js"></script>
<script type="text/javascript">
var ShiftSpace = {
  info: function() {
    return {
      server: __server
    };
  }
};
</script>
<script type="text/javascript" src="/client/core/RemoteFunctions.js"></script>
<script type="text/javascript" src="/client/pin/RangeCoder.js"></script>
<script type="text/javascript" src="/client/pin/Pin.js"></script>
<script type="text/javascript" src="/client/pin/PinHelpers.js"></script>
<script type="text/javascript" src="/client/pin/PinWidget.js"></script>
<script type="text/javascript" src="/client/helpers/ShiftSpaceElement.js"></script>
<script type="text/javascript" src="/client/Space.js" charset="utf-8"></script>
<script type="text/javascript" src="/client/Shift.js" charset="utf-8"></script>
