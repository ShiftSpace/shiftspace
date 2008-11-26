// ==Builder==
// @optional
// @name              PostInitDeclarations
// ==/Builder==

if(typeof ShiftSpace == 'undefined') ShiftSpace = {};

// new additions for Sandalphon
ShiftSpaceUI = {}; // holds all UI class objects
ShiftSpaceObjects = new Hash(); // holds all instantiated UI objects
ShiftSpaceNameTable = new Hash(); // holds all instantiated UI object by CSS id

// TODO: remove this dependency - David
ShiftSpaceClassPaths = {
  'SSTableViewDatasource': '/client/'
};

// TODO: paths to view controllers, should probably just default unless defined in UserClassPaths - David
ShiftSpaceUIClassPaths = {
  'SSCell': '/client/views/SSCell/',
  'SSEditableTextCell': '/client/views/SSEditableTextCell/',
  'SSTabView': '/client/views/SSTabView/',
  'SSTableView': '/client/views/SSTableView/',
  'SSTableRow': '/client/views/SSTableRow/',
  'SSConsole': '/client/views/SSConsole/'
};

  // path to user defined view controllers
ShiftSpaceUserClassPaths = {
  'SSCustomTableRow': '/client/customViews/SSCustomTableRow/' // TODO: change this to point to the real folder - David
};

// ShiftSpace global var is set by this point not before.
ShiftSpace.info = SSInfo;
// export for third party deveopers
ShiftSpace.Element = SSElement;
ShiftSpace.Iframe = SSIframe;
ShiftSpace.Input = SSInput;