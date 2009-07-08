// ==Builder==
// @test
// @suite             Core
// ==/Builder==

var NotificationTest = new Class({
  
  Extends: SSUnitTest.TestCase,
  name: 'NotificationTest',  
  
  setup: function()
  {
    this.dummyObjectA = {
      getId: function() { return 'dummyObjectA'},
      __awake: false,
      awake: function() { this.__awake == true; },
      isAwake: function() { return this.__awake; },
      doSomething: function(data) 
      { 
        this.notified = true;
        this.data = data;
      },
      notifyB: function(data)
      {
        SSPostNotification("FooBarNotificationB", data);
      }
    };
    
    this.dummyObjectB = {
      getId: function() { return 'dummyObjectB' },
      __awake: false,
      awake: function() { this.__awake == true; },
      isAwake: function() { return this.__awake; },
      doSomething: function(data) 
      { 
        this.notified = true;
        this.data = data;
      },
      notifyC: function(data)
      {
        SSPostNotification("FooBarNotificationC", data)
      }
    };
    
    this.dummyObjectC = {
      getId: function() { return 'dummyObjectB' },
      __awake: false,
      awake: function() { this.__awake == true; },
      isAwake: function() { return this.__awake; },
      doSomething: function(data) 
      {
        this.notified = true;
        this.data = data;
      },
      handleNotif: function(data)
      {
        this.data = data;
      }
    };
    
    ShiftSpaceObjects.dummyObjectA = this.dummyObjectA;
    ShiftSpaceObjects.dummyObjectB = this.dummyObjectB;
    ShiftSpaceObjects.dummyObjectC = this.dummyObjectC;
  },
  
  
  tearDown: function()
  {
    SSNotificationCenterReset();
  },
  
  
  testAddObserver: function()
  {
    this.doc("Add an observer");
    
    var fnrefA = this.dummyObjectA.doSomething.bind(this.dummyObjectA);
    SSAddObserver(this.dummyObjectA, "FooBarNotification", fnrefA);

    this.assertEqual(SSGetObservers("FooBarNotification").dummyObjectA[0], fnrefA);
    
    var fnrefB = this.dummyObjectB.doSomething.bind(this.dummyObjectB);
    SSAddObserver(this.dummyObjectB, "FooBarNotification", fnrefB, this.dummyObjectA);
    
    this.assertEqual(SSGetObservers("FooBarNotification", this.dummyObjectA).dummyObjectB[0], fnrefB);
  },
  
  
  testRemoveObserver: function()
  {
    this.doc("Remove a specific observer");
    
    var fnrefA = this.dummyObjectA.doSomething.bind(this.dummyObjectA);
    SSAddObserver(this.dummyObjectA, "FooBarNotification", fnrefA);
    SSRemoveObserver(this.dummyObjectA, "FooBarNotification");
    
    this.assertEqual(SSGetObservers("FooBarNotification").dummyObjectA, null);
    
    var fnrefB = this.dummyObjectB.doSomething.bind(this.dummyObjectB);
    SSAddObserver(this.dummyObjectB, "FooBarNotification", fnrefB, this.dummyObjectA);
    SSRemoveObserver(this.dummyObjectB, "FooBarNotification", this.dummyObjectA);
    
    this.assertEqual(SSGetObservers("FooBarNotification", this.dummyObjectA).dummyObjectB, null);
  },
  
  
  testAddToNotificationQueue: function()
  {
    this.doc("Add an object to the notification queue.");
    
    var fnrefA = this.dummyObjectA.doSomething.bind(this.dummyObjectA);
    SSAddObserver(this.dummyObjectA, "FooBarNotification", fnrefA);
    SSPostNotification("FooBarNotification");
    
    this.assertNotEqual(SSNotificationQueueForObject(this.dummyObjectA), null);
  },
  
  
  testEmptyNotificationQueue: function()
  {
    this.doc("Flush the notification queue");
    
    var fnrefA = this.dummyObjectA.doSomething.bind(this.dummyObjectA);
    SSAddObserver(this.dummyObjectA, "FooBarNotification", fnrefA);
    SSPostNotification("FooBarNotification");

    SSEmptyNotificationQueue();
    
    this.assertEqual(SSNotificationQueueForObject(this.dummyObjectA), null);
  },
  
  
  testPostNotification: function()
  {
    this.doc("Post a notification");
    
    var fnrefA = this.dummyObjectA.doSomething.bind(this.dummyObjectA);
    SSAddObserver(this.dummyObjectA, "FooBarNotification", fnrefA);
    this.dummyObjectA.__awake = true;

    SSPostNotification("FooBarNotification");

    this.assertEqual(this.dummyObjectA.notified, true);
  },
  
  
  testPostNotificationWithData: function()
  {
    this.doc("Post a notification with data");
    
    var fnrefA = this.dummyObjectA.doSomething.bind(this.dummyObjectA);
    SSAddObserver(this.dummyObjectA, "FooBarNotification", fnrefA);
    this.dummyObjectA.__awake = true;
    
    var data = {foo:"bar"};
    SSPostNotification("FooBarNotification", data);
    
    this.assertEqual(this.dummyObjectA.data, data);
  },
  
  
  testPostNotificationToMultipleObservers: function()
  {
    this.doc("Post a notification to multiple observers");
    
    var fnrefA = this.dummyObjectA.doSomething.bind(this.dummyObjectA);
    SSAddObserver(this.dummyObjectA, "FooBarNotification", fnrefA);
    
    var fnrefB = this.dummyObjectB.doSomething.bind(this.dummyObjectB);
    SSAddObserver(this.dummyObjectB, "FooBarNotification", fnrefB);
    
    this.dummyObjectA.__awake = this.dummyObjectB.__awake = true;
    
    SSPostNotification("FooBarNotification");
    
    this.assertEqual(this.dummyObjectA.notified, true);
    this.assertEqual(this.dummyObjectB.notified, true);
  },
  

  testPostNotificationChain: function()
  {
    this.doc("Trigger a chain of notifications");
    
    var fnrefA = this.dummyObjectA.notifyB.bind(this.dummyObjectA);
    SSAddObserver(this.dummyObjectA, "FooBarNotificationA", fnrefA);

    var fnrefB = this.dummyObjectB.notifyC.bind(this.dummyObjectB);
    SSAddObserver(this.dummyObjectB, "FooBarNotificationB", fnrefB);

    var fnrefC = this.dummyObjectC.handleNotif.bind(this.dummyObjectC);
    SSAddObserver(this.dummyObjectC, "FooBarNotificationC", fnrefC);
    
    this.dummyObjectA.__awake = this.dummyObjectB.__awake = this.dummyObjectC.__awake = true;
    var data = {foo:"bar"};
    SSPostNotification("FooBarNotificationA", data);
    
    this.assertEqual(this.dummyObjectC.data, data);
  },
  
  
  testPostNotificationNoObserver: function()
  {
    this.doc("Post a notification which has no observer");
  },
  
  
  testRaiseObjectDoesNotImplementGetId: function()
  {
    this.doc("Throw error when an observer does not implement getId.");
  }

});