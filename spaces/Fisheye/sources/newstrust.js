
var FisheyeCriticismNewsTrustRenderClass = FisheyeCriticismRenderClass.extend({

    key: 10,

    name: 'NewsTrust',

    color: '#AAA', 

    renderIcon: function(that, target) {

/*
	// Box to hold icon
	that.iconBox = new ShiftSpace.Element('div', {'class':'FisheyeIconBox'});
	that.iconBox.setStyles({
	    'width':  that.newsTrustIconLink ? '92px' : '16px',
	    'height':  '16px',
	});
	that.iconBox.injectInside(target);

	// NT icon or rating as stars
	that.iconImageBox = new ShiftSpace.Element('div');
*/
	var img = "http://www.newstrust.net/Images/newstrust.gif";
	//if (that.newsTrustIconLink)
	    //img = that.newsTrustIconLink;
	//that.iconImageBox.setHTML('<img src="' + img + '" />');
	var percentStr = "";
	if (that.newsTrustRating > 0) {
	  var percent = that.newsTrustRating / .05;
	  percent = percent.toFixed(0); // round off decimal points for print
	  percentStr += percent + '%';
	}
	that.wrapSetHTML(target, '<img src="' + img + '" />' + percentStr);
	//that.iconImageBox.injectInside(that.iconBox);

	// Get NT data if necessary
	if (!that.haveQueriedNewsTrust) {
	      that.haveQueriedNewsTrust = true;
	      this.queryNewsTrust(that);
	}

	this.appendMode(that, target, "");
    },

    renderCategory: function(that, isEdit, container) {

	if (isEdit) {
	    FisheyeDefaultRenderClass.renderCategory(that, isEdit, container);
	    return;
	}

/*
	var someBox = new ShiftSpace.Element('div');
	someBox.setStyles({
	    'padding':  '10px 0px 10px 0px',
	});

	    // TODO: createImg func
	var imgBox = new ShiftSpace.Element('div');
	imgBox.setStyles({
	    'height':  '24px',
	    'width':  '161px',
	    'margin-left' : '50px',
	    'float':  'center',
	});
	var img = "http://www.newstrust.net/Images/ui/newstrust-logo_24px.gif";
	var someHtml = '<a href="http://www.newstrust.net/">';
	someHtml += '<img src="' + img + '" width="161" height="24"/></a>';
	that.wrapSetHTML(imgBox, someHtml);
	imgBox.injectInside(someBox);

	someBox.injectInside(container);
*/
    },


    renderSummary: function(that) {
	var summaryBox = new ShiftSpace.Element ('div', {'class':'FisheyeSummary'});
	summaryBox.setStyles({ 'width' : '250px', });

	// XXX: i18n for plugins?
	if (that.newsTrustResponseStatus == 200) {
	    var sumHtml = "NewsTrust users have rated this story on a 5.0 scale and given it a ";
		// TODO: review vs reviews
	    sumHtml += "<b>" + that.newsTrustRating + "</b> avg. based on <b>";
	    sumHtml += that.newsTrustNumReviews + "</b> reviews";
	    that.wrapSetHTML(summaryBox, sumHtml);
	}
	else if (that.newsTrustResponseStatus)
	    summaryBox.appendText("NewsTrust server failed with " + that.newsTrustResponseStatus);
	else
	    summaryBox.appendText("looking for NewsTrust rating...");

	var aBox = new ShiftSpace.Element ('div', {
	    'class' : 'FisheyeDisplayItem',
	    'display' : 'block',
	});

	var aHref = "http://www.newstrust.net/webx?14@@" + that.criticismLink;
	var aLink = this.createLink(aHref, "[Read Reviews]", aBox);

	aHref = "http://www.newstrust.net/Stories/review-rate.htm!storyid=";
	aHref += that.criticismLink;

	var bLink = this.createLink(aHref, "[Write Review]", aBox);
	aBox.injectInside(summaryBox);
	
	summaryBox.injectInside (that.detailsBox);
    },

    // Don't render link, in display case, it is inside summary
    // In edit case, let it be rendered as normal because the input
    // method is used for NewsTrust storyID
    renderLinkBox: function(that, isEdit, container) {
	if (isEdit) {
	    // XXX: OO stuff isn't quite working out
	    //this.parent.renderLinkBox(that, isEdit, container);
	    container.appendText("NT story ID: ");
	    FisheyeDefaultRenderClass.renderLinkBox(that, isEdit, container);
	}
    },

    // Grab a story page from NT
    queryNewsTrust: function(that) {
	var realThis = this;
	that.log("queryNewsTrust");
	  // XXX: hardcoded ID length is poor way to avoid querying before ID set
	if (!that.criticismLink || that.criticismLink.length <= 5) {
	    that.log("NewsTrust storyID seems invalid");
	    return;
	}
	var url = "http://www.newstrust.net/webx?14@@";
	url += that.criticismLink; // ".f708fe5";

	that.getWebPage(url,
	    function(response) {
		this.log("got response");
		this.newsTrustResponseStatus = response.status;
		if (response.status == 200)
		    realThis.parseNewsTrustStoryPage(this, response.responseText);
	}.bind(that))
    },


    parseNewsTrustStoryPage: function(that, body) {

	// Find relevant part of document
	var strIdx = body.indexOf("Our Rating");
	strIdx = body.indexOf('<div class="rating">', strIdx);

	// Parse out image
	var imgIdx = body.indexOf('<img src="', strIdx) + 10;
	var imgEnd = body.indexOf('"', imgIdx);
	var imgText = body.substr(imgIdx, imgEnd-imgIdx);
	// EG "/Images/newstrust/stars/stars-large/stars-4-0.gif";
	that.newsTrustIconLink = "http://www.newstrust.net" + imgText;

	  // Parse out summary text
	strIdx = body.indexOf('<span class=', strIdx);
	strIdx = body.indexOf('>', strIdx);
	var strEnd = body.indexOf('</span>', strIdx);
	that.newsTrustRateText = body.substr(strIdx+1, strEnd-strIdx-1);

	// Parse out rating
	// XXX: breaks if there is only 1 rating (different text)
	strIdx = body.indexOf('Our Rating');
	strIdx = body.indexOf('Quality', strIdx);
	strIdx = body.indexOf('"numeric_rating">', strIdx);
	that.newsTrustRating = body.substr(strIdx+17, 3);

	// parse out number of reviews
	strIdx = body.indexOf('Our Rating');
	//strIdx = body.indexOf('Quality', strIdx);
	var notenoughIdx = body.indexOf('not enough reviews', strIdx);
	if (notenoughIdx != -1)
		strIdx = notenoughIdx + 18;
	var endIdx = body.indexOf(' review', strIdx);
	strIdx = endIdx-1;
	// Handle multi-digit numbers TODO: test on NT page with 10+ reviews
	var ValidChars = "0123456789.";
	while (strIdx > 0 && ValidChars.indexOf(body.charAt(strIdx-1)) != -1)
	  strIdx--;
	that.log("got endIdx '" + endIdx + "' (strIdx '" + strIdx + "')");
	that.newsTrustNumReviews = 
	    body.substr(strIdx, endIdx-strIdx);
	    //body.substr(strIdx, 12);

	that.rebuild();
    },

    // Source is already obvious
    renderSource: function() {},

    getDisplaySummary: function(that) {
	return"NewsTrust";
    },

    changeLinkPrompt : "Enter the NewsTrust story ID.  If the story page is http://www.newstrust.net/webx?14@@.f708fe5 then the ID is .f708fe5 (note the dot is part of the ID in this example)",

});

var FisheyeNewsNoteRenderClass = new FisheyeCriticismNewsTrustRenderClass();

var languages = {
    key: 'NT',
    name: 'NewsTrust',
    color: '#AAA', 
    renderClass: FisheyeNewsNoteRenderClass,
};

someLang = languages;


