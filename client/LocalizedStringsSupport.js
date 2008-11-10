// ==Builder==
// @required
// @name              LocalizedStringsSupport
// @package           Internationalization
// ==/Builder==

var __sslang__ = null;
function SSLoadLocalizedStrings(lang, ctxt)
{
  var context = ctxt || window;
  //SSLog('load localized strings ' + lang);
  SSLoadFile("client/LocalizedStrings/"+lang+".js", function(rx) {
    SSLog(')))))))))))))))))))))))))))))))))))))))))))');
    SSLog(lang + " - " + __sslang__);
    if(lang != __sslang__)
    {
      SSLog('Evaluating language file');
      ShiftSpace.localizedStrings = JSON.decode(rx.responseText);
      //SSLog(ShiftSpace.localizedStrings);

      // update objects
      ShiftSpace.Objects.each(function(object, objectId) {
        if(object.localizationChanged) object.localizationChanged();
      });

      // in case we get a raw context from FF3
      if(!context.$$)
      {
        context = new Window(context);
      }

      // update markup
      //SSLog('fix localized');
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

    __sslang__ = lang;
  });
}