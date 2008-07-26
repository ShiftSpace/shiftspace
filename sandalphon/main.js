window.addEvent('domready', init);

function init()
{
  console.log('Sandalphon, sister of Metatron, starting up.');

  $('interfaceFile').addEvent('keyup', function(_evt) {
    var evt = new Event(_evt);
    if(evt.key == 'enter')
    {
      loadFile(this.getProperty('value'));
    }
  });
}

function loadFile(fileName)
{
  new Request({
    
  });
}