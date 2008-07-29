var SSProxyMessageTimeout;
var SSProxyMessageIsVisible = true;
var SSProxyMessageIsAnimating = false;

window.addEvent('domready', function() {
  SSProxyMessageInit();
});

function SSProxyMessageInit()
{
  SSProxyMessageTimeout = setTimeout(SSProxyMessageHide, 10000);
  
  $('SSProxyMessage').addEvent('mouseover', function(_evt) {
    if(!SSProxyMessageIsVisible)
    {
      SSProxyMessageShow();
    }
    
    if(SSProxyMessageTimeout)
    {
      clearTimeout(SSProxyMessageTimeout);
    }
    
    SSProxyMessageTimeout = setTimeout(SSProxyMessageHide, 10000);
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
      SSProxyMessageIsVisible = true;
    }
  });
  
  showFx.start({
    right: [0, -503]
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