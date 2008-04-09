<?php

header('Content-Type: text/plain');

?>
// ==UserScript==
// @name           ShiftSpace (developer)
// @namespace      http://shiftspace.org/
// @description    An open source layer above any website
// @include        *
// ==/UserScript==
/*

Script: shiftspace-dev.user.js
Loads a dynamically-generated userscript for developing the ShiftSpace core.

*/

if (!GM_getValue('server', true)) {
    // GreaseKit doesn't know about default values
    var server = '<?php echo $server; ?>';
    var debug = 1;
} else {
    var server = GM_getValue('server', '<?php echo $server; ?>');
    var debug = GM_getValue('debug', 1);
    if (debug == '0') {
        debug = 0;
    }
}

if (typeof GM_registerMenuCommand != 'undefined') {
    GM_registerMenuCommand("Set ShiftSpace server", function() {
        var defaultValue = GM_getValue('server', window.location.href);
        var newServer = prompt("Please enter your ShiftSpace server URL (include a trailing slash)", defaultValue);
        GM_setValue('server', newServer);
    });
    if (debug) {
        var menuTitle = "Disable ShiftSpace debug mode";
    } else {
        var menuTitle = "Enable ShiftSpace debug mode";
    }
    GM_registerMenuCommand(menuTitle, function() {
        if (debug) {
            GM_setValue('debug', 0);
        } else {
            GM_setValue('debug', 1);
        }
    });
}

GM_xmlhttpRequest({
    method: 'GET',
    url: server + 'shiftspace.php?debug=' + debug + '&cacheFiles=0&method=shiftspace.user.js&' + new Date().getTime(),
    onload: function(rx) {
        eval(rx.responseText);
    }
});
