

var FisheyeCriticismSourceWatchRenderClass = FisheyeCriticismRenderClass.extend({

    renderIcon: function(that, target) {

	// Box to hold icon
	that.iconBox = new ShiftSpace.Element('div', {'class':'FisheyeIconBox'});
	that.iconBox.setStyles({
	    'width':  '16px', 'height':  '16px',
	});
	that.iconBox.injectInside(target);

	addImage ("http://sourcewatch.org/favicon.ico", that.iconBox);

	this.appendMode(that, target, "");
    },

    renderCategory: function(that, isEdit, container) {

	if (isEdit) {
	    FisheyeDefaultRenderClass.renderCategory(that, isEdit, container);
	    return;
	}

	var someBox = new ShiftSpace.Element('div');
	someBox.setStyles({ 'padding':  '10px 0px 10px 0px', });

	    // TODO: createImg func
	var imgBox = new ShiftSpace.Element('div');
	imgBox.setStyles({ 
		'height':  '66px', 
		'width':  '250px',
		'display':  'block',
		'background-image':  'url("http://www.sourcewatch.org/skins/monobook/sw_logo_right2.jpg")',
	});
	// XXX: needs to be a link to sourcewatch.org
	// XXX: too many boxes here?

	imgBox.injectInside(someBox);
	someBox.injectInside(container);
    },


    renderSummary: function(that) {
	var summaryBox = new ShiftSpace.Element ('div', {'class':'FisheyeSummary'});
	summaryBox.setStyles({ 'max-width' : '230px', });

	var sumHtml = "SourceWatch has an open wiki page on ";
	sumHtml +=  that.criticismLink;
	that.wrapSetHTML(summaryBox, sumHtml);

	var aBox = new ShiftSpace.Element ('div', {'class':'FisheyeDisplayItem'});
	var aHref = "http://www.sourcewatch.org/index.php?title=" + that.criticismLink;
	var aLink = this.createLink(aHref, "[" + that.getText('read') + "]", aBox);
	aBox.injectInside(summaryBox);
	summaryBox.injectInside (that.detailsBox);
    },

    // Don't render link, in display case, it is inside summary
    // In edit case, let it be rendered as normal because the input
    // method is used for NewsTrust storyID
    renderLinkBox: function(that, isEdit, container) {
	if (isEdit) {
	    container.appendText("SW page title: ");
	    FisheyeDefaultRenderClass.renderLinkBox(that, isEdit, container);
	}
    },

    getDisplaySummary: function(that) {
	return "SourceWatch: " + that.criticismLink;
    },

    changeLinkPrompt : "Enter the SourceWatch page title.  If the page is http://www.sourcewatch.org/index.php?title=Jonah_Goldberg then the title is Jonah_Goldberg",

});
var FisheyeSourceWatchRenderClass = new FisheyeCriticismSourceWatchRenderClass();

var languages = {
    key: 'SW',
    name: 'SourceWatch',
    color: '#AAA', 
    renderClass: FisheyeSourceWatchRenderClass,
};

someLang = languages;


