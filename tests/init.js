window.addEvent('domready', init);

function init()
{
  $("loadTestInput").setProperty("value", localStorage.getItem("test"));
  $('loadTest').addEvent('click', function(_evt) {
    var test = $('loadTestInput').getProperty('value');
    localStorage.setItem('test', test);
    SSTestRunner.loadTest(test);
  });
}