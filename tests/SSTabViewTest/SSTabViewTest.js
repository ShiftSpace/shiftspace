// ==Builder==
// @test
// @suite             UI
// ==/Builder==

var SSTabViewTest = new Class({
  name: 'SSTabViewTest',
  Extends: SSUnitTest.TestCase,

  setup: function()
  {
    console.log('running setup!');
    Sandalphon.reset();
  },
  
  tearDown: function()
  {
    console.log('running teardown!');
  },
  
    /*
   Tests: indexOfTabByName, indexOfTabByName
   */
  testIndexOfTabByName: function(){
    
     this.doc("get index of a tab by id name");

     var hook = this.startAsync();

     Sandalphon.compileAndLoad('tests/SSTabViewTest/SSTabViewTest1', function(ui) {

       Sandalphon.addStyle(ui.styles);
       $('SSTestRunnerStage').set('html', ui.interface);
       Sandalphon.activate($('SSTestRunnerStage'));
       
       var tabView = SSControllerForNode($('SSTabViewTest'));

       var indexTab1 = tabView.indexOfTabByName("SSTabView1");
       var indexTab2 = tabView.indexOfTabByName("SSTabView2");
       var indexTab3 = tabView.indexOfTabByName("SSTabView3");
       var falseIndex = tabView.indexOfTabByName("SSFakeTab");
       
       this.assertEqual(indexTab1, 0, hook);
       this.assertEqual(indexTab2, 1, hook);
       this.assertEqual(indexTab3, 2, hook);
       this.assertEqual(falseIndex, -1, hook);
       
       this.endAsync(hook);

     }.bind(this));
    
  },
   
   /*
   Tests: selectedTab
   */
  testSelectTab: function(){

      this.doc("select tab by id name");

      var hook = this.startAsync();

      Sandalphon.compileAndLoad('tests/SSTabViewTest/SSTabViewTest1', function(ui) {

        Sandalphon.addStyle(ui.styles);
        $('SSTestRunnerStage').set('html', ui.interface);
        Sandalphon.activate($('SSTestRunnerStage'));

        var tabView = SSControllerForNode($('SSTabViewTest'));
    
        tabView.selectTabByName("SSTabView1");
        var selectedTab1 = tabView.selectedTab();
        this.assertEqual(selectedTab1, tabView.indexOfTabByName("SSTabView1"), hook);
        
        tabView.selectTabByName("SSTabView2");
        var selectedTab2 = tabView.selectedTab();
        this.assertEqual(selectedTab2, tabView.indexOfTabByName("SSTabView2"), hook);
        
        tabView.selectTabByName("SSTabView3");
        var selectedTab3 = tabView.selectedTab();
        this.assertEqual(selectedTab3, tabView.indexOfTabByName("SSTabView3"), hook);
    
        this.endAsync(hook);

      }.bind(this));

   },
   
   /*
   Tests: tabButtonForName, tabButtonForIndex
   */
   testTabButtonDOM: function(){

       this.doc("get DOM node of tab by name/index");

       var hook = this.startAsync();

       Sandalphon.compileAndLoad('tests/SSTabViewTest/SSTabViewTest1', function(ui) {

         Sandalphon.addStyle(ui.styles);
         $('SSTestRunnerStage').set('html', ui.interface);
         Sandalphon.activate($('SSTestRunnerStage'));

         var tabView = SSControllerForNode($('SSTabViewTest'));
   
         var selectedTab1 = tabView.tabButtonForName("SSTabView1");
         this.assertNotEqual(selectedTab1, null, hook);
         var selectedTab2 = tabView.tabButtonForName("SSTabView2");
         this.assertNotEqual(selectedTab2, null, hook);
         var selectedTab3 = tabView.tabButtonForName("SSTabView3");
         this.assertNotEqual(selectedTab3, null, hook);
         
         var selectedTabIndex1 = tabView.tabButtonForIndex(0);
         this.assertNotEqual(selectedTabIndex1, undefined, hook);
         var selectedTabIndex2 = tabView.tabButtonForIndex(1);
         this.assertNotEqual(selectedTabIndex2, undefined, hook);
         var selectedTabIndex3 = tabView.tabButtonForIndex(2);
         this.assertNotEqual(selectedTabIndex3, undefined, hook);

         this.endAsync(hook);

       }.bind(this));

    }, 
     /*
     Tests: tabButtonForName, tabButtonForIndex
     */
     testContentViewIndex: function(){

         this.doc("get index of contentView by name");
 
         var hook = this.startAsync();

         Sandalphon.compileAndLoad('tests/SSTabViewTest/SSTabViewTest1', function(ui) {

           Sandalphon.addStyle(ui.styles);
           $('SSTestRunnerStage').set('html', ui.interface);
           Sandalphon.activate($('SSTestRunnerStage'));

           var tabView = SSControllerForNode($('SSTabViewTest'));

           var selectedTab1 = tabView.indexOfContentView("SSTabPane1");
           this.assertNotEqual(selectedTabIndex1, 0, hook);
           var selectedTab2 = tabView.indexOfContentView("SSTabPane2");
           this.assertNotEqual(selectedTabIndex2, 1, hook);
           var selectedTab3 = tabView.indexOfContentView("SSTabPane3");
           this.assertNotEqual(selectedTabIndex3, 2, hook);
           
           this.endAsync(hook);

         }.bind(this));

      }

  
});