window.addEvent('domready', initInstallButton);

function initInstallButton()
{
  $('install').addEvent('click', load);
}

function load()
{
  new Request({
    method: 'get',
    url: '/build',
    onComplete: function(responseText)
    {
      var json = JSON.decode(responseText);
      if(json.message == 'ok')
      {
        window.open('/builds/shiftspace.dev.user.js');
      }
    }
  }).send();
}