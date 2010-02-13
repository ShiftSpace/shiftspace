<link type="text/css" rel="stylesheet" href="/styles/ShiftSpace.css"></link>
<link type="text/css" rel="stylesheet" href="/styles/SSProxyMessage.css"></link>
<script type="text/javascript">
    var ShiftSpaceProxyMode = true;
    if(!window.console) {
        window.console = {
            log: function() {},
            error: function() {}
        };
    }
    var SSLog = console.log;
    var SSLogMessage,
        SSLogError,
        SSLogWarning,
        SSLogRequest,
        SSLogForce,
        SSInclude,
        SSLogSystem;
</script>
<script type="text/javascript">
    var __server = "${server}";
    var __spacesPath = "${spacesPath}";
</script>
<script type="text/javascript" src="/externals/mootools-1.2.3-core.js"></script>
<script type="text/javascript" src="/externals/mootools-1.2.3.1-more.js"></script>
<script type="text/javascript" src="/externals/functools/FuncTools.js"></script>
<script type="text/javascript" src="/externals/set/Set.js"></script>
<script type="text/javascript" src="/externals/promises/Promises.js"></script>
<script type="text/javascript" src="/externals/MTMods.js"></script>
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

    function SSDescribeException(_exception)
    {
      var temp = [];
      for(var prop in _exception)
      {
         temp.push(prop + ':' + _exception[prop]);
      }
      return "Exception:{ " + temp.join(', ') +" }";
    }
</script>
<script type="text/javascript" src="/client/core/UtilityFunctions.js"></script>
<script type="text/javascript">
    ShiftSpace.info = SSInfo;
</script>
<script type="text/javascript" src="/client/core/RemoteFunctions.js"></script>
<script type="text/javascript" src="/client/pin/RangeCoder.js"></script>
<script type="text/javascript" src="/client/pin/Pin.js"></script>
<script type="text/javascript">
    ShiftSpace.Pin = ShiftSpacePin;
</script>
<script type="text/javascript" src="/client/pin/PinHelpers.js"></script>
<script type="text/javascript" src="/client/pin/PinWidget.js"></script>
<script type="text/javascript" src="/client/helpers/ShiftSpaceElement.js"></script>
<script type="text/javascript">
    ShiftSpace.Element = SSElement;
    ShiftSpace.Iframe = SSIframe;
</script>
<script type="text/javascript" src="/client/helpers/IframeHelpers.js"></script>
<script type="text/javascript" src="/client/user/Space.js" charset="utf-8"></script>
<script type="text/javascript" src="/client/user/Shift.js" charset="utf-8"></script>
<script type="text/javascript">
    ShiftSpace.Space = ShiftSpaceSpace;
    ShiftSpace.Shift = ShiftSpaceShift;
</script>
<script type="text/javascript" src="/spaces/${space}/${space}.js" charset="utf-8"></script>
<script type="text/javascript">
    ${space}Space.implement({
        attributes: function() {
            return ${attrs};
        }
    });
</script>
<link id="NotesCss" type="text/css" rel="stylesheet" href="/spaces/${space}/${space}.css" charset="utf-8"></script>
<script type='text/javascript' charset='utf-8'>
    var ${space};
    window.addEvent('domready', function() {
        ${space} = new ${space}Space(${space}Shift);
        var theShift = ${shift};
        theShift = $merge(theShift, {id:'${shiftId}'});
        console.log(theShift);
        ${space}.showShift(theShift);
        ${space}.orderFront('${shiftId}');
    });
</script>
