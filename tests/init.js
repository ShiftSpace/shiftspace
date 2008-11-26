window.addEvent('domready', init);

function init()
{
  var runner = new SSTestRunner();
  $('loadTest').addEvent('click', function(_evt) {
    runner.loadTest($('loadTestInput').getProperty('value'), $('env').getProperty('value'));
  });
}
