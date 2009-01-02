// ==Builder==
// @required
// @name              SandalphonSupport
// @package           System
// @dependencies      SandalphonCore
// ==/Builder==

var SSInstantiationListeners = {};
function SSAddInstantiationListener(element, listener)
{
  var id = element._ssgenId();
  if(!SSInstantiationListeners[id])
  {
    SSInstantiationListeners[id] = [];
  }
  SSInstantiationListeners[id].push(listener);
}

function SSNotifyInstantiationListeners(element)
{
  var listeners = SSInstantiationListeners[element.getProperty('id')];
  if(listeners)
  {
    listeners.each(function(listener) {
      if(listener.onInstantiate)
      {
        listener.onInstantiate();
      }
    });
  }
}

var __controllers__ = $H();
// NOTE: we generate ids and store controller refs ourselves this is because of weird garbage collection
// around iframes and wrappers around dom nodes when SS runs under GM - David
function SSSetControllerForNode(controller, _node)
{
  var node = $(_node);

  // generate our own id
  node._ssgenId();
  // keep back reference
  __controllers__.set(node.getProperty('id'), controller);
}

// return the controller for a node
function SSControllerForNode(_node)
{
  var node = $(_node);
  return __controllers__.get(node.getProperty('id')) ||
         (node.getProperty('uiclass') && new SSViewProxy(node)) ||
         null;
}

function SSControllerOrNode(object)
{
  return SSControllerForNode(object) || object;
}

function SSIsController(object)
{
  if($type(object) == 'element')
  {
    return false;
  }
  else if(object._genId)
  {
    return true;
  }
  return false;
}

function SSGetInlineOptions(el)
{
  return JSON.decode(el.getProperty('options'));
}