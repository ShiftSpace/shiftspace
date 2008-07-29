var SSProxyMessageTimeout;
var SSProxyMessageIsVisible = true;
var SSProxyMessageIsAnimating = false;

window.addEvent('domready', function() {
  SSProxyMessageInit();
});

function SSProxyMessageInit()
{
  SSProxyMessageTimeout = setTimeout(SSProxyMessageHide, 3000);
  
  $('SSProxyMessage').addEvent('mouseenter', function(_evt) {
    if(!SSProxyMessageIsVisible && !SSProxyMessageIsAnimating)
    {
      // show it
      SSProxyMessageIsVisible = true;
      SSProxyMessageShow();
      
      // prepare the next hide
      if(SSProxyMessageTimeout) clearTimeout(SSProxyMessageTimeout);
      SSProxyMessageTimeout = setTimeout(SSProxyMessageHide, 3000);
    }
  });
}

function SSProxyMessageShow()
{
  var showFx = $('SSProxyMessage').effects({
    duration: 500, 
    transition: Fx.Transitions.Cubic.easeOut,
    onStart: function()
    {
      SSProxyMessageIsAnimating = true;
    },
    onComplete: function()
    {
      SSProxyMessageIsAnimating = false;
    }
  });
  
  showFx.start({
    right: [-503, 0]
  });
}

function SSProxyMessageHide()
{
  var hideFx = $('SSProxyMessage').effects({
    duration: 500,
    transition: Fx.Transitions.Cubic.easeOut,
    onStart: function()
    {
      SSProxyMessageIsAnimating = true;
    },
    onComplete: function()
    {
      SSProxyMessageIsAnimating = false;
      SSProxyMessageIsVisible = false;
    }
  });
  
  hideFx.start({
    right: [0, -503]
  });
}