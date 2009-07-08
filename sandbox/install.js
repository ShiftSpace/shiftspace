window.addEvent('domready', initInstallButton);

function initInstallButton()
{
  $('install').addEvent('click', compileAndLoad);
}

function compileAndLoad()
{
  new Request({
    method: 'get',
    url: 'install.php',
    onComplete: function(responseText)
    {
      var json = JSON.decode(responseText);
      if(json.data == 'ok')
      {
        window.open('../builds/shiftspace.dev.user.js');
      }
    }
  }).send();
}