var Highlighter = new Class({
			
	/* implements */
	Implements: [Options],

	/* options */
	options: {
		autoUnhighlight: true,
		caseSensitive: false,
		elements: '*',
		className: '',
		onlyWords: false,
		tag: 'span'
	},
	
	/* initialization */
	initialize: function(options) {
		/* set options */
		this.setOptions(options);
		this.elements = $$(this.options.elements);
		this.words = [];
	},
	
	/* directs the plugin to highlight elements */
	highlight: function(words,elements,className, replace) {
		
		/* figure out what we need to use as element(s) */
		var elements = $$(elements || this.elements);
		var klass = className || this.options.className;
		if (words.constructor === String) { words = [words]; }
		
		/* auto unhighlight old words? */
		if(this.options.autoUnhighlight) { this.unhighlight(); }
		
		/* set the pattern and regex */
		var pattern = '(' + words.join('|') + ')';
		pattern = this.options.onlyWords ? '\\b' + pattern + '\\b' : pattern;
		var regex = new RegExp(pattern, this.options.caseSensitive ? '' : 'i');
		
		/* run it for each element! */
		elements.each(function(el) { this.recurse(el,regex,klass,replace); },this);
		
		/* make me chainable! */
		return this;
	}, 
	
	/* unhighlights items */
	unhighlight: function(words,replace) {
		//var selector = this.options.tag + (word ? '[rel=' + word + ']' : '');
		if (words.constructor === String) { words = [words]; }
		words.each(function(word) {
			word = (this.options.caseSensitive ? word : word.toUpperCase());
			if(this.words[word]) {
				var elements = $$(this.words[word]);
				elements.set('class','');
				elements.each(function(el) {
				  if(replace) el.set('text',replace);
					var tn = document.createTextNode(el.get('text'));
					el.getParent().replaceChild(tn,el);
				});
			}
		},this);
		return this;
	},
	
	/* recursed function */
	recurse: function(node,regex,klass,replace) {
			if (node.nodeType === 3) {
				var match = node.data.match(regex);
				if (match) {
					/* new element */
					var highlight = new Element(this.options.tag);
					highlight.addClass(klass);
					var wordNode = node.splitText(match.index);
					wordNode.splitText(match[0].length);
					var wordClone = wordNode.cloneNode(true);
					highlight.appendChild(wordClone);
					wordNode.parentNode.replaceChild(highlight, wordNode);
					highlight.set('rel',highlight.get('text'));
					var comparer = highlight.get('text');
					if(!this.options.caseSensitive) { comparer = highlight.get('text').toUpperCase(); }
					if(replace) highlight.set('text',replace);
					if(!this.words[comparer]) { this.words[comparer] = []; }
					this.words[comparer].push(highlight);
					return 1;
				}
			} else if ((node.nodeType === 1 && node.childNodes) && !/(script|style)/i.test(node.tagName) && !(node.tagName === this.options.tag.toUpperCase() && node.className === klass)) {
				for (var i = 0; i < node.childNodes.length; i++) {
					i += this.recurse(node.childNodes[i],regex,klass);
				}
			}
			return 0;
		}
	});

var AnotherWordIsPossibleSpace = Space({
  setup: function(options) {
    // Your space code goes here:
      
  } //end setup
      
});

var AnotherWordIsPossibleShift = Shift({
  setup: function(json) {
    //Your Shift code goes here:
          
    this.setPosition(json.position);
    this.makeDraggable({handle: this.element.getElement('h1.drag_it')});
    //this.save();
    
    if(json.originalWord && json.newWord){
      this.element.getElement('input.originalWord').set('value', json.originalWord);
      this.element.getElement('input.newWord').set('value', json.newWord);
      this.doReplace();
    }; 
        
    this.element.getElement('.go').addEvent('click', this.doReplace.bind(this));
    
    //this.save();

  },
  
  doReplace: function (){
      
    var originalWord = this.element.getElement('input.originalWord').get('value');
    var newWord = this.element.getElement('input.newWord').get('value');
    var words = {};
    words[originalWord] = newWord;
        
    // prepareRegex by JoeSimmons
    // Used to take a string and ready it for use in new RegExp()
    String.prototype.prepareRegex = function() {
      return this.replace(/([\[\]\^\&\$\.\(\)\?\/\\\+\{\}\|])/g, "\\$1");
    };
    
    function isOkTag(tag) {
      return ("pre,blockquote,code,input,button,textarea".indexOf(","+tag) == -1);
    }
    
    var regexs=new Array(),
    replacements=new Array();
    for(var word in words) {
      if(word != "") {
        regexs.push(new RegExp("\\b"+word.prepareRegex().replace(/\*/g,'[^ ]*')+"\\b", 'gi'));
        //words[word] = "<span class='newText'>" + words[word] +"</span>";
        replacements.push(words[word]);
      }
    }
    
    var texts = document.evaluate(".//text()[normalize-space(.)!='']",document.body,null,6,null), text="";
    for(var i=0,l=texts.snapshotLength; (this_text=texts.snapshotItem(i)); i++) {
    	if(isOkTag(this_text.parentNode.tagName.toLowerCase()) && (text=this_text.textContent)) {
    	 for(var x=0,l=regexs.length; x<l; x++) {
    	   text = text.replace(regexs[x], replacements[x]);
    	   //var span = new Element('span', {'class':'replaced'});
    	   this_text.textContent = text;
    	   //span.wraps(this_text);
    	 }
    	}
    }
    
    this.originalWord = originalWord;
    this.newWord = newWord;
    this.summary = originalWord + " >>> " + newWord;
    
    this.save();
    
  },
  
  encode: function() {
    return {
      summary : this.summary,
      originalWord : this.originalWord,
      newWord : this.newWord,
      position : this.getPosition()
    };
  }

  
});