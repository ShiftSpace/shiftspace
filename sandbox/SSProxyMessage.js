var SSProxyMessageTimeout;
var SSProxyMessageIsVisible = true;
var SSProxyMessageIsAnimating = false;

window.addEvent('domready', function() {
  SSProxyMessageInit();
});

function SSProxyMessageInit()
{
  SSProxyMessageTimeout = setTimeout(SSProxyMessageHide, 5000);
  
  $('SSProxyMessage').addEvent('mouseenter', function(_evt) {
    if(!SSProxyMessageIsVisible && !SSProxyMessageIsAnimating)
    {
      SSProxyMessageIsVisible = true;
      SSProxyMessageShow();
      if(SSProxyMessageTimeout) clearTimeout(SSProxyMessageTimeout);
      SSProxyMessageTimeout = setTimeout(SSProxyMessageHide, 5000);
    }
  });
  
  $('SSProxyMessage').addEvent('mousemove', function(_evt) {
    var evt = new Event(_evt);
    if(SSProxyMessageIsVisible && !SSProxyMessageIsAnimating)
    {
      if(SSProxyMessageTimeout) clearTimeout(SSProxyMessageTimeout);
      SSProxyMessageTimeout = setTimeout(SSProxyMessageHide, 5000);
    }
  });
}

function SSProxyMessageShow()
{
  $('SSProxyMessage').set('tween', {
    duration: 500, 
    transition: Fx.Transitions.Cubic.easeOut,
    onStart: function() { SSProxyMessageIsAnimating = true; },
    onComplete: function() { SSProxyMessageIsAnimating = false; }
  });
  $("SSProxyMessage").tween('right', [-503, 0]);
}

function SSProxyMessageHide()
{
  $('SSProxyMessage').set('tween', {
    duration: 500,
    transition: Fx.Transitions.Cubic.easeOut,
    onStart: function() { SSProxyMessageIsAnimating = true; },
    onComplete: function()
    {
      SSProxyMessageIsAnimating = false;
      SSProxyMessageIsVisible = false;
    }
  });
  $("SSProxyMessage").tween('right', [0, -503]);
}