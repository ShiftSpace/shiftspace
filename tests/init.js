window.addEvent('domready', init);

function init()
{
  $('loadTest').addEvent('click', function(_evt) {
    SSTestRunner.loadTest($('loadTestInput').getProperty('value'));
  });
}
