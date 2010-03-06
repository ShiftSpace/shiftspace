if(SandalphonTool)
{
  SandalphonTool.runTest = function()
  {
    console.log('running test!');
    
    var welcomePane = $('WelcomePane');
    var myFrame = new IFrame();
    myFrame.addEvent('load', function() {
      console.log(this.contentWindow);
      console.log(this.contentWindow.$);
      this.contentWindow.$(this.contentWindow.document.body).set('html', "<input class='SSInputField' type='button' value='Cool!' id='cool' outlet='SSConsole'></input>");
      Sandalphon.initializeOutlets(this.contentWindow);
    });
    myFrame.injectInside(welcomePane);
  }
}