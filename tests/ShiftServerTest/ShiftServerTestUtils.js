// ==Builder==
// @test
// ==/Builder==

var SSApp = SSApplication();

var AlreadyLoggedInError = "AlreadyLoggedInError";
var AlreadyLoggedOutError = "AlreadyLoggedOutError";
var InvalidUserNameError = "InvalidUserNameError";
var IncorrectPasswordError = "IncorrectPasswordError";
var UserNotLoggedInError = "UserNotLoggedInError";

var NoEmailError = "NoEmailError";
var MissingUserNameError = "MissingUserNameError";
var ShortUserNameError = "ShortUserNameError";
var UserNameAlreadyExistsError = "UserNameAlreadyExistsError";
var MissingPasswordError = "MissingPasswordError";
var MissingPasswordVerifyError = "MissingPasswordVerifyError";
var PasswordMatchError = "PasswordMatchError";
var FollowError = "FollowError";

var UserDoesNotExistError = "UserDoesNotExistError";
var PermissionError = "PermissionError";
var ResourceDoesNotExistError = "ResourceDoesNotExistError";
var NoDataError = "NoDataError";

var CreateEventError = "CreateEventError";
var CreatePermissionError = "CreatePermissionError";

var AlreadySubscribedError = "AlreadySubscribedError";
var NotSubscribedError = "NotSubscribedError";


var ack = JSON.encode({"message":"ok"});

var noteShift = {
  space: {name:"Notes", version:"0.1"},
  summary: "Foo!",
  href: "http://google.com/image_search",
  content: {
    text: "Hello world!",
    position: {x:150, y:150},
    size: {x:200, y:200}
  }
};

var highlightsShift = {
  space: {name:"Highlights", version:"0.1"},
  summary: "Bar!",
  href: "http://google.com/image_search",
  content: {}
};

var fakemary = {
  userName: "fakemary",
  email: "fakemary@gmail.com",
  password:"foobar",
  passwordVerify:"foobar"
};

var fakedave = {
  userName: "fakedave",
  email: "fakedave@gmail.com",
  password:"barfoo",
  passwordVerify:"barfoo"
};

var fakejohn = {
  userName: "fakejohn",
  email: "fakejohn@gmail.com",
  password:"bazfoo",
  passwordVerify:"bazfoo"
};

var admin = {
  userName: 'shiftspace',
  email: 'info@shiftspace.org',
  password: 'shiftspace',
  passwordVerify: 'shiftspace'
};


function SSGetData(json)
{
  return json.data;
}


function SSGetType(json)
{
  return json.type;
}


var resourceDelegate = {
  optionsForTable: function()
  {
    return {
      byHref: String.urlJoin(SSInfo().server, 'sandbox/')
    };
  }
};

function createResource() {
  return new SSTable("AllShifts", {
    resource: {create:'shift', read:'shifts', update:'shift', 'delete':'shift'},
    watches: [{
                events: [{resource:"shift", method:"create"},
                         {resource:"shift", method:"update"},
                         {resource:"shift", method:"delete"},
                         {resource:"shift", action:"comment"},
                         {resource:"shift", action:"publish"},
                         {resource:"shift", action:"unpublish"}],
                handlers: [SSTable.dirtyTheViews]
              },
              {
                events: [{resource:"shift", method:"create"}],
                handlers: [function(shift) { SSApplication().setDocument(this.getName(), shift); }]
              }],
    delegate: resourceDelegate
  });
}

function createResource2() {
  return new SSTable("MyShifts", {
    resource: {create:'shift', read:'user/'+User.getUserName()+'/shifts', update:'shift', 'delete':'shift'},
    watches: [{resource:"shift", method:"create"},
              {resource:"shift", method:"update"},
              {resource:"shift", method:"delete"},
              {resource:"shift", action:"comment"},
              {resource:"shift", action:"publish"},
              {resource:"shift", action:"unpublish"}],
    conditions: function(shift) { return shift.userName == User.getUserName(); }
  });
}

function createResource3() {
  return new SSTable("MyShifts", {
    resource: {read:'shifts'},
    watches: [{
                events:[{resource:"shift", method:"create"},
                        {resource:"shift", method:"update"},
                        {resource:"shift", method:"delete"},
                        {resource:"shift", action:"comment"},
                        {resource:"shift", action:"publish"},
                        {resource:"shift", action:"unpublish"}],
                handlers: function() { this.dirtyTheViews(); }
              }],
    views: ["MyShiftsListView"]
  });
}

// create and remote resources
// this means app should store by name for events
// and look them up
function createResource4() {
  return new SSTable("shift/foo/comments", {
    resource: {read:"shift/foo/comments"},
    watches: [{
                events:[{resource:"comments", method:"create"},
                        {resource:"comments", method:"update"},
                        {resource:"comments", method:"delete"}],
                handler: function() { this.dirtyTheViews(); }
              }]
  });
}