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
  },
  
  
  testAddObserver: function()
  {
    this.doc("Add an observer");
    
    var fnrefA = this.dummyObjectA.doSomething.bind(this.dummyObjectA);
    SSAddObserver(this.dummyObjectA, "FooBarNotification", fnrefA);
    
    this.assertEqual(SSGetObservers("FooBarNotification").get('dummyObjectA'), fnrefA);
    
    var fnrefB = this.dummyObjectB.doSomething.bind(this.dummyObjectB);
    SSAddObserver(this.dummyObjectB, "FooBarNotification", fnrefB, this.dummyObjectA);
    
    this.assertEqual(SSGetObservers("FooBarNotification", this.dummyObjectA).get('dummyObjectB'), fnrefB);
  },
  
  
  testRemoveObserver: function()
  {
    this.doc("Remove a specific observer");
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