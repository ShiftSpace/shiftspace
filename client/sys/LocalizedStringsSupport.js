// ==Builder==
// @required
// @name              LocalizedStringsSupport
// @package           Internationalization
// ==/Builder==

var __sslang = null;
function SSLoadLocalizedStrings(lang, ctxt)
{
  var context = ctxt || window;
  SSLoadFile("client/localizedStrings/"+lang+".json", function(rx) {
    if(lang != __sslang)
    {
      ShiftSpace.localizedStrings = JSON.decode(rx.responseText);

      // update objects
      ShiftSpaceObjects.each(function(object, objectId) {
        if(object.localizationChanged) object.localizationChanged();
      });

      // in case we get a raw context from FF3
      if(!context.$$)
      {
        context = new Window(context);
      }

      // update markup
      context.$$(".SSLocalized").each(function(node) {

        var originalText = node.getProperty('title');

        if(node.get('tag') == 'input' && node.getProperty('type') == 'button')
        {
          node.setProperty('value', SSLocalizedString(originalText));
        }
        else
        {
          node.set('text', SSLocalizedString(originalText));
        }

      }.bind(this));
    }

    __sslang = lang;
  });
}