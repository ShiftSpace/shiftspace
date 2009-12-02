// ==Builder==
// @uiclass
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
  
  /*
    Function: check
      Check the ShiftListViewCell. Suppresses the ShiftListViewCell.onCheck
      call if passed with a restore parameter set to true. This is used when the
      owning <SSListView> refreshes.
      
    Parameters:
      restore - boolean
  */
  check: function(restore)
  {
    var el = this.lockedElement();
    el.getElement('input[type=checkbox]').setProperty('checked', true);
    if(restore !== true) this.onCheck();
  },
  
  /*
    Function: onCheck
      *private*
      Call's setState on the owning <SSListView>. Posts an onShiftSelect
      notification.

    See Also:
      <PublishPane>
  */
  onCheck: function()
  {
    var idx = this.index(), data = this.data();
    this.delegate().setState(data._id, 'checked', this.check.bind(this, [true]));
    SSPostNotification('onShiftSelect', {listView: this.delegate(), index:idx});
  },
  
  /*
    Function: uncheck
      Uncheck the ShiftListViewCell. Suppresses the ShiftListViewCell.onCheck
      call if passed with restore parameter set to true. This is used when the
      owning <SSListView> refreshes.
      
    Parameters:
      restore - boolean
  */
  uncheck: function(restore)
  {
    var el = this.lockedElement();
    el.getElement('input[type=checkbox]').setProperty('checked', false);
    if(restore !== true) this.onUncheck();
  },
  
  /*
    function: onUncheck
      *private*
      Call's remoteState on the owning <SSListView>. Posts an onShiftDeselect
      notification.
      
    See Also:
      <PublishPane>
  */
  onUncheck: function()
  {
    var idx = this.index(), data = this.data();
    if(data) this.delegate().removeState(data._id, 'checked');
    SSPostNotification('onShiftDeselect', {listView: this.delegate(), index:idx});
  },
  
  
  clone: function()
  {
    var clone = this.parent();

    clone.getElement('input[type=checkbox]').addEvent('click', function(evt) {
      evt = new Event(evt);
      var target = $(evt.target);
      var li = (target.get('tag') == 'li') ? target : target.getParent('li');
      var idx = this.delegate().indexOfCellNode(li);
      if(target.getProperty('checked'))
      {
        this.lock(li);
        this.onCheck();
        this.unlock();
      }
      else
      {
        this.lock(li);
        this.onUncheck();
        this.unlock();
      }
      evt.stopPropagation();
    }.bind(this));

    var favoriteButton = clone.getElement('.favoriteButton');
    if(favoriteButton)
    {
      favoriteButton.addEvent("click", function(evt) {
        evt = new Event(evt);
        var target = $(evt.target), li = target.getParent("li");
        this.lock(li);
        var id = this.data()._id, p;
        this.unlock();
        if(!target.hasClass("favorited"))
        {
          p = SSFavoriteShift(id);
          p.realize();
        }
        else
        {
          p = SSUnfavoriteShift(id);
          p.realize();
        }
        evt.stop();
      }.bind(this))
    }

    var comments = clone.getElement(".comments");
    if(comments)
    {
      comments.addEvent("click", function(evt) {
        evt = new Event(evt);
        var target = $(evt.target), li = target.getParent("li");
        this.lock(li);
        var id = this.data()._id, p;
        this.unlock();
        SSPostNotification("showComments", id);
        evt.stop();
      }.bind(this))
    }

    return clone;
  },

  
  setUnread: function(unread)
  {
    var el = this.lockedElement();
    el.getElement(".unread").set("text", (unread) ? "unread" : "read");
  },
  
  setRead: function(read)
  {
    var el = this.lockedElement();
    if (read)
    {
      el.removeClass("unread");
    }
    else
    {
      el.addClass("unread");
    }
  },
  
  setSummary: function(summary)
  {
    var el = this.lockedElement();
    el.getElement('.summary').set('text', summary);
  },


  setDisplayString: function(displayString)
  {
    var el = this.lockedElement();
    el.getElement(".displayString").set('text', displayString);
  },
  
  
  setPublishData: function(publishData, shift)
  {
    var el = this.lockedElement();
    if(shift.userName == ShiftSpaceUser.getUserName())
    {
      el.getElement('.status').addClass((publishData.draft && "private") || "public");
    }
  },
  
  setCreatedStr: function(createdStr)
  {
    var el = this.lockedElement();
    el.getElement('.date').set('text', createdStr);
  },
  
  setModifiedStr: function(modifiedStr)
  {
    var el = this.lockedElement();
    el.getElement('.date').set('text', modifiedStr);
  },

  setSpace: function(space)
  {
    var el = this.lockedElement(), name = el.getElement('.spaceName'), icon = el.getElement('.spaceIcon');
    if(name) name.set('text', space.name);
    if(icon) icon.setProperty('src', SSInfo(space.name).icon);
  },
  
  
  setUserName: function(userName)
  {
    var el = this.lockedElement();
    el.getElement('.userName').set('text', userName);
    if(ShiftSpace.User.isLoggedIn() && ShiftSpace.User.getUserName() == userName)
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
  },
  
  
  setHref: function(href)
  {
    var el = this.lockedElement();
    var url = href.substr(7, href.length);
    var parts = url.split("/");
    
    var link = new Element('a', {'href':href,'html':parts[0],'class':'domain'});
    link.inject(el.getElement(".domain"));
  },


  setDomain: function(domain)
  {
    var el = this.lockedElement();
    el.getElement(".domain").set("text", domain);
  },
  
  
  setCommentCount: function(count)
  {
    var el = this.lockedElement(); 
    if (count > 0)
    {
      el.getElement('.comments').set('text', count);
      el.getElement('.comments').addClass('hasComment');
    }
  },


  setFavoriteCount: function(count)
  {
    var el = this.lockedElement();
    if (count > 0)
    {
      el.getElement('.favoriteCount').set('text', count);
    }
  },
  
  
  setFavorite: function(favorite)
  {
    var el = this.lockedElement();
    if(favorite)
    {
      el.getElement('.favoriteButton').addClass('favorited');
    }
    else
    {
      el.getElement('.favoriteButton').removeClass('favorited');
    }
  },


  setText: function(text)
  {
    var el = this.lockedElement();
    el.getElement(".text").set("text", text);
  }

});

