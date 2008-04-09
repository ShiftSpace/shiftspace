window.addEvent('domready', function() {
    
    var sectionNum = 0;
    var showSection = 0;
    var currPage = window.location.href.match(/([^\/]+\.html)/)[1];
    
    // Top-level nav links
    $$('#nav a.section').each(function(link) {
        
        if (link.getAttribute('href').indexOf(currPage) != -1) {
            showSection = sectionNum;
            link.parentNode.addClass('selected');
        }
        
        link.addEvent('click', function(e) {
            var event = new Event(e);
            event.preventDefault();
            this.blur();
            $$('#nav li.selected')[0].removeClass('selected');
            this.parentNode.addClass('selected');
        });
        
        sectionNum++;
    });
    
    // Setup the navigation panel
    new Accordion($$('#nav a.section'), $$('#nav ul'), {
        'show': showSection
    });
    
    // Add "top" links to each H2 element
    $$('h2').each(function(h2) {
        
        var text = new Element('div');
        text.setHTML(h2.innerHTML);
        
        var topLink = new Element('a', {
            'href': '#top'
        });
        topLink.appendText('TOP');
        
        var br = new Element('br');
        
        h2.innerHTML = '';
        text.injectInside(h2);
        topLink.injectInside(h2);
        
        var method = h2.getAttribute('id').match(/(.+)\..+\(\)/);
        if (method) {
            var className = method[1].toLowerCase();
            if (className != 'shiftspace') {
                className = 'shiftspace.' + className;
            }
            var classLink = new Element('a', {
                'href': '#' + className
            });
            classLink.appendText('CLASS');
            classLink.injectInside(h2);
        }
        
        br.injectInside(h2);
    });
    
    // Give anchor links a scrolling animation
    $$('a').each(function(link) {
        
        var href = link.getAttribute('href');
        var anchor = href.match(/#(.+)$/);
        var page = href.match(/([^\/]+\.html)/);
        
        if (anchor && (!page || page[1] == currPage)) {
            link.addEvent('click', function(e) {
                var event = new Event(e);
                event.preventDefault();
                var pos = $(anchor[1]).getPosition();
                new Fx.Scroll(window, {
                    onComplete: function() {
                        window.location = '#' + anchor[1];
                    }
                }).scrollTo(pos.x, pos.y);
            });
        }
    });
    
    
});
