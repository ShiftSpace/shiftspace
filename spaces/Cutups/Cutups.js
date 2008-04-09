var CutupsSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'Cutups',
    title: 'Cutups',
    icon: 'HelloWorld.png', 
    version: 0.1,
    css: 'Cutups.css'
  },
  buildInterface: function(){
    this.buildFrame();
    this.SSCutupWidgetFrame.makeDraggable();
  },
  //build iframe and set styles for frame
  buildFrame: function(){
    this.SSCutupWidgetFrame = new ShiftSpace.Element('iframe',{
        id:'SSCutupWidgetFrame',
        name:'SSCutupWidgetFrame',
        styles: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          border: 'none',
          borderTop: '15px #444 solid',
          backgroundColor: '#EEE',
          width: '160px',
          height: '136px',
          opacity: 0.4,
        },
        events: {
          load: function(){
            this.buildWidgetContent();
            this.buildWidgetCSS();
          }.bind(this)
        }
    });
    this.SSCutupWidgetFrame.injectInside(document.body);
  },
  //build inner html of widget iframe
  buildWidgetContent: function(){
    this.widgetContent = new Element('div', {
        id:'widgetContent'
    });
    this.widgetContent.setHTML('<h1>CUTUPS</h1>' + 
    '<table>' +
      '<tr>' +
        '<td><input type="checkbox" name="onCut" id="onCut" checked="true" /></td>' +
        '<td><label for="onCut">on</label></td>' +
      '</tr>' +
      '<tr>' +
      '<th colspan="2">sort type</th>' +
      '</tr>' +
      '<tr>' +
        '<td><input type="radio" name="sortType" id="random" value="random" checked="true" /></td>' +
        '<td><label for="random">random</label></td>' +
      '</tr>' +
      '<tr>' + 
        '<td><input type="radio" name="sortType" id="alpha" value="alpha" /></td>' +
        '<td><label for="alpha" />alphabetize</td>' + 
      '</tr>' +
      '<tr>' +
        '<td><input type="radio" name="sortType" id="ralpha" value="ralpha" /></td>' +
        '<td><label for="ralpha">reverse alphabetize</label></td>' +
      '</tr>' +
    '</table>');
    var doc = this.SSCutupWidgetFrame.contentDocument;
    this.widgetContent.injectInside(doc.body);
  },
  //stick CSS in head of iframe if head exists if not create head element
  buildWidgetCSS: function(){
    var doc = $('SSCutupWidgetFrame').contentDocument;
     if( doc.getElementsByTagName('head').length != 0 )
    {
       var head = doc.getElementsByTagName('head')[0];
    }
    else
    {
      // In Safari iframes don't get the head element by default - David
      // Mootools-ize body
      $(doc.body);
      var head = new Element( 'head' );
      head.injectBefore( doc.body );
    }
    this.widgetCSS = new Element('style', {
    'type':'text/css'
    });
    this.widgetCSS.setHTML('*{' +
      'margin:0px;' +
      'padding:0px;' +
      'font-size: 12px;' +
      'line-height:1.5em;'+
      'text-align: left;'+
    '}'+
    '#widgetContent{'+
      'font-family:helvetica,sans-serif;'+
      'color:#444;'+
      'background-color:#EEE;'+
      'padding: 5px;'+
      'width: 150px'+
    '}'+
    '#widgetContent h1{'+
      'font-size:14px;'+
      'height:14px;'+
      'color:#444;'+
      'line-height:14px;'+
      'padding:5px 0;'+
    '}'+
    '#widgetContent th{'+
      'text-align: left;'+
      'font-weight: normal;'+
    '}'+
    '#widgetContent td{'+
      'padding-right:5px;'+
    '}');
    var doc = this.SSCutupWidgetFrame.contentDocument;
    var head = doc.getElementsByTagName("head")[0];
    this.widgetCSS.injectInside(head);
  }  
});

var CutupsShift = ShiftSpace.Shift.extend({
  initialize: function(json){
    this.parent(json);
    window.addEvent('mouseup', function(){
        this.getSortType();
        if(this.getOnState() == true){
          this.cutUpSelection();
        }
    }.bind(this));
  },
  SSCutupWidgetFrame: $("SSCutupWidgetFrame"),
  getOnState: function(){
    var doc = $("SSCutupWidgetFrame").contentDocument;
    var isOn = doc.getElementById("onCut").checked;
    if(isOn == true){
      return true;
    }else{
      return false;
    }
  },
  sortType: null,
  setSortType: function(sortType){
    this.sortType = sortType;
  },
  getSortType: function(){
    var doc = $("SSCutupWidgetFrame").contentDocument;
    var sort = doc.getElementsByName("sortType");
    for(var i=0;i<sort.length;i++){
      if(sort[i].checked == true){
        this.setSortType(i);
      }
    }
  },
  sortTextNodes: function(node){
    //if node is text node and node has something in it and not just whitespace
    if(node.nodeType === 3 && node.nodeValue.match(/(\s)?\S+/g) && !node.nodeValue.match(/^\S+$/)){
      var str = node.nodeValue;
      str = str.replace(/\n/g,"");
      var pattern = /(\s)?\S+/g;
      var strArray = str.match(pattern);
      var len = strArray.length - 1;
      strArray[len] = strArray[len].match(/(?!\S$)/)? strArray[len] + " " : strArray[len];
      //strArray[0] = strArray[0].match(/(?!^\s)/)? " " + strArray[0] : strArray[0];
      switch(this.sortType){      
      case 1:
        var sortedArray = strArray.sort();
        break;
      case 2:
        var sortedArray = strArray.sort().reverse();
        break;        
      default:
        var sortedArray = strArray.sort(function(a,b){
            return Math.random() - 0.5;
        });
        break;  
      }
      //if beginning or ending item in array isn't padded pad it
      //not doing so ends up concatenating multiple strings into one
      //sortedArray[len] = sortedArray[len].match(/(?!\s$)/)? sortedArray[len] + " " : sortedArray[len];
      //sortedArray[0] = sortedArray[0].match(/(?!^\s)/)? " " + sortedArray[0] : sortedArray[0];
      var cutUpString = "";
      for(var i=0;i<sortedArray.length;i++){
        cutUpString += sortedArray[i];
      }
      node.nodeValue = cutUpString;
      str = null;
      strArray = null;
      sortedArray = null;
      cutUpString = null;
    }
    if(node.hasChildNodes() === true){
      for(var i=0;i<node.childNodes.length;i++){
        this.sortTextNodes(node.childNodes[i]);
      }
    }
  },
  cutUpSelection: function(){
    var userSelection = window.getSelection();
    var myRange = userSelection.getRangeAt(0);
    var rangeString = myRange.toString();
    if(rangeString == ""){return false;}
    var docFrag = myRange.extractContents();
    this.sortTextNodes(docFrag);
    myRange.insertNode(docFrag);
    document.normalizeDocument();
    docFrag,userSelection,myRange = null;
  }     
});

var Cutups = new CutupsSpace(CutupsShift);
