// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSListViewCell
// ==/Builder==

var ShiftListViewCell = new Class({

  Extends: SSListViewCell,
  name: "ShiftListViewCell",
  
  
  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  
  
  clone: function()
  {
    var clone = this.parent();
    clone.getElement('input[type=checkbox]').addEvent('click', function(evt) {
      evt = new Event(evt);
      var li = (evt.target.get('tag') == 'li') ? evt.target : evt.target.getParent('li');
      var idx = this.delegate().indexOfCellNode(li);
      if(evt.target.getProperty('checked'))
      {
        SSPostNotification('onShiftSelect', {listView: this.delegate(), index:idx});
      }
      else
      {
        SSPostNotification('onShiftDeselect', {listView: this.delegate(), index:idx});
      }
      evt.stopPropagation();
    }.bind(this));
    return clone;
  },
  
  
  setSummary: function(summary)
  {
    var el = this.lockedElement();
    el.getElement('.summary').set('text', summary);
  },
  
  
  setDate: function(date)
  {
    var el = this.lockedElement();
    el.getElement('.date').set('text', date);
  },
  
  
  setSpace: function(space)
  {
    var el = this.lockedElement();
    el.getElement('.spaceIcon').setProperty('src', SSInfo(space.name).icon);
  },
  
  
  setUserName: function(userName)
  {
    var el = this.lockedElement();
    el.getElement('.userName').set('text', userName);
    if(ShiftSpace.User.isLoggedIn())
    {
      el.getElement('.userName').addClass('loggedin')
    }
    else
    {
      el.getElement('.userName').removeClass('loggedin');
    }
  },
  
  
  setGravatar: function(gravatar)
  {
    var el = this.lockedElement();
    el.getElement('.gravatar').setProperty('src', gravatar);
  }

});

