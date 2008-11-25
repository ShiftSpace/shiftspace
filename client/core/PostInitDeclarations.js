// ==Builder==
// @optional
// @name              PostInitDeclarations
// ==/Builder==

if(typeof ShiftSpace == 'undefined') ShiftSpace = {};

// new additions for Sandalphon
ShiftSpace.UI = {}; // holds all UI class objects
ShiftSpace.Objects = new Hash(); // holds all instantiated UI objects
ShiftSpace.NameTable = new Hash(); // holds all instantiated UI object by CSS id

// TODO: remove this dependency - David
ShiftSpace.ClassPaths = {
  'SSTableViewDatasource': '/client/'
};

// TODO: paths to view controllers, should probably just default unless defined in UserClassPaths - David
ShiftSpace.UIClassPaths = {
  'SSCell': '/client/views/SSCell/',
  'SSEditableTextCell': '/client/views/SSEditableTextCell/',
  'SSTabView': '/client/views/SSTabView/',
  'SSTableView': '/client/views/SSTableView/',
  'SSTableRow': '/client/views/SSTableRow/',
  'SSConsole': '/client/views/SSConsole/'
};

  // path to user defined view controllers
ShiftSpace.UserClassPaths = {
  'SSCustomTableRow': '/client/customViews/SSCustomTableRow/' // TODO: change this to point to the real folder - David
};

// ShiftSpace global var is set by this point not before.
ShiftSpace.info = SSInfo;
// export for third party deveopers
ShiftSpace.Element = SSElement;
ShiftSpace.Iframe = SSIframe;
ShiftSpace.Input = SSInput;