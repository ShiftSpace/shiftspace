// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSCell
// ==/Builder==

var SSInstalledSpaceCell = new Class({
  
  Extends: SSCell,
  name: "SSInstalledSpaceCell",
  
  
  awake: function(context)
  {
    this.mapOutletsToThis();
  },


  clone: function()
  {
    var clone = this.parent();
    clone.addEvent("click", function(evt) {
      evt = new Event(evt);
      var target = ($(evt.target).get("tag") == "li") ? evt.target : evt.target.getParent("li");
      this.lock(target);
      // call action method with proper data
      ShiftSpaceNameTable.SettingsTabView.showSpaceSettings(
        this, {data: this.delegate().dataForCellNode(this.lockedElement())}
      );
      this.unlock();
    }.bind(this));
    return clone;
  },
  
  
  setIcon: function(imageSrc, data)
  {
    var el = this.lockedElement();
    if(imageSrc)
    {
      var attrs = SSGetSpaceAttributes(data.name);
      el.getElement('img').setProperty('src', attrs.icon);
    }
  },
  
  
  setName: function(name)
  {
    var el = this.lockedElement();
    if(name)
    {
      el.store('spaceName', name);
      el.getElement('.name').setProperty('text', name);
    }
  },


  getName: function()
  {
    var el = this.lockedElement();
    return el.retrieve('spaceName');
  },
  
  
  setTagline: function(tagline)
  {
    var el = this.lockedElement();
    el.getElement(".tagline").setProperty("text", tagline || "");
  },
  
  
  localizationChanged: function()
  {
    SSLog('SSInstalledSpaceCell localizationChanged', SSLogForce);
  }
});