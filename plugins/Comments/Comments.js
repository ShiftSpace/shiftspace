var CommentsPlugin = ShiftSpace.Plugin.extend({
  pluginType: ShiftSpace.Plugin.types.get('kInterfaceTypePlugin'),

  attributes:
  {
    name: 'Comments',
    title: null,
    icon: null,
    css: 'Comments.css',
    version: 0.2
  },
  
  setup: function()
  {
    // intialize
  },
  
  
  setCurrentShiftId: function(newShiftId)
  {
    this.__currentShiftId__ = newShiftId;
  },
  
  
  currentShiftId: function()
  {
    return this.__currentShiftId__;
  },
  
  
  showCommentsForShift: function(shiftId)
  {
    this.setCurrentShiftId(shiftId);
    
    this.serverCall('load', {
      shiftId: shiftId
    }, function(json) {
      this.element.setHtML(json.html);
      this.showInterface();
    });
  },
  
  
  eventDispatch: function(_evt)
  {
    var evt = new Event(_evt);
    var target = evt.target;
    
    // switch on target class
  },
  
  
  addComment: function()
  {
    this.serverCall('add', {
      shiftId: this.currentShiftId(),
      comment: {}
    }, function(json) {
      console.log('comment added');
    });
  },
  
  
  removeComment: function()
  {
    
  },
  
  
  editComment: function()
  {
    
  },
  
  
  updateComment: function()
  {
    
  },
  
  
  showInterface: function()
  {
    if(!this.interfaceIsBuilt())
    {
      this.buildInterface();
    }

    // show ourselves
    // put the console to half width
    ShiftSpace.Console.halfMode();
  },
  
  
  hideInterface: function()
  {
    // hide ourselves
    // put the Console back to normal width
    ShiftSpace.Console.fullMode();
  },
  
  
  buildInterface: function()
  {
    this.setInterfaceIsBuilt(true);
    
  }
  
  
});


var Trails = new CommentsPlugin();
ShiftSpace.__externals__.Comments = Comments; // For Safari & Firefox 3.1