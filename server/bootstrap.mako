<link type="text/css" rel="stylesheet" href="/styles/ShiftSpace.css"></link>
<link type="text/css" rel="stylesheet" href="/styles/SSProxyMessage.css"></link>
<script type="text/javascript">
    if(!window.console) {
        window.console = {
            log: function() {},
            error: function() {}
        };
    }
    var SSLog = function() {};
</script>
<script type="text/javascript">
    var __server = "${server}";
    var __spacesDir = "${spacesDir}";
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
</script>
<script type="text/javascript" src="/client/core/RemoteFunctions.js"></script>
<script type="text/javascript" src="/client/pin/RangeCoder.js"></script>
<script type="text/javascript" src="/client/pin/Pin.js"></script>
<script type="text/javascript" src="/client/pin/PinHelpers.js"></script>
<script type="text/javascript" src="/client/pin/PinWidget.js"></script>
<script type="text/javascript" src="/client/helpers/ShiftSpaceElement.js"></script>
<script type="text/javascript" src="/client/user/Space.js" charset="utf-8"></script>
<script type="text/javascript" src="/client/user/Shift.js" charset="utf-8"></script>
<script type="text/javascript">
    ShiftSpace.Space = ShiftSpaceSpace;
    ShiftSpace.Shift = ShiftSpaceShift;
</script>
<script type="text/javascript" src="/spaces/${space}/${space}.js" charset="utf-8"></script>
<link type="text/css" rel="stylesheet" src="/spaces/${space}/${space}.css" charset="utf-8"></script>
<script type='text/javascript' charset='utf-8'>
    window.addEvent('domready', function() {
        /*
        var ${space} = new ${space}Space(${space}Shift);
        var theShift = ${shift};
        theShift = $merge(theShift, {id:'${shiftId}'});
        ${space}.setCssLoaded(true);
        ${space}.showShift(theShift);
        ${space}.orderFront('${shiftId}');
        */
    });
</script>
