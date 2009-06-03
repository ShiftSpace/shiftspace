// ==Builder==
// @test
// @suite             Core
// ==/Builder==

var NotificationTest = new Class({
  
  name: 'NotificationTest',

  Extends: SSUnitTest.TestCase,
  
  
  setup: function()
  {
    this.dummyObjectA = {
      getId: function() { return 'dummyObjectA'},
      __awake: false,
      awake: function() { this.__awake == true; },
      isAwake: function() { return this.__awake; },
      doSomething: function(data) { console.log('dummyObjectA notified!' + data) }
    };
    
    this.dummyObjectB = {
      getId: function() { return 'dummyObjectB' },
      __awake: false,
      awake: function() { this.__awake == true; },
      isAwake: function() { return this.__awake; },
      doSomething: function(data) { console.log('dummyObjectB notified!' + data) }
    };
    
    this.dummyObjectC = {
      getId: function() { return 'dummyObjectB' },
      __awake: false,
      awake: function() { this.__awake == true; },
      isAwake: function() { return this.__awake; },
      doSomething: function(data) { console.log('dummyObjectC notified!' + data) }
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
  
  
  testFlushObserverQueue: function()
  {
    this.doc("Flush the observer queue");
  },
  
  
  testPostNotification: function()
  {
    this.doc("Post a notification");
  }

});