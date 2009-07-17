// ==Builder==
// @package           Calendar
// ==/Builder==

/*
Script: Clientcide.js
	The Clientcide namespace.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var Clientcide = {
	version: '2.1.0',
	setAssetLocation: function(baseHref) {
		var clean = function(str){
			return str.replace(/\/\//g, '/');
		};
		if (window.StickyWin && StickyWin.UI) {
			StickyWin.UI.implement({
				options: {
					baseHref: clean(baseHref + '/stickyWinHTML/')
				}
			});
			if (StickyWin.Alert) {
				StickyWin.Alert.implement({
					options: {
						baseHref: baseHref + "/simple.error.popup"
					}
				});
			}
			if (StickyWin.UI.Pointy) {
				StickyWin.UI.Pointy.implement({
					options: {
						baseHref: clean(baseHref + '/PointyTip/')
					}
				});
			}
		}
		if (window.TagMaker) {
			TagMaker.implement({
			    options: {
			        baseHref: clean(baseHref + '/tips/')
			    }
			});
		}
		if (window.ProductPicker) {
			ProductPicker.implement({
			    options:{
			        baseHref: clean(baseHref + '/Picker')
			    }
			});
		}

		if (window.Autocompleter) {
			Autocompleter.Base.implement({
					options: {
						baseHref: clean(baseHref + '/autocompleter/')
					}
			});
		}

		if (window.Lightbox) {
			Lightbox.implement({
			    options: {
			        assetBaseUrl: clean(baseHref + '/slimbox/')
			    }
			});
		}

		if (window.Waiter) {
			Waiter.implement({
				options: {
					baseHref: clean(baseHref + '/waiter/')
				}
			});
		}
	},
	preLoadCss: function(){
		if (window.StickyWin && StickyWin.ui) StickyWin.ui();
		if (window.StickyWin && StickyWin.pointy) StickyWin.pointy();
		Clientcide.preloaded = true;
		return true;
	},
	preloaded: false
};
(function(){
	if (!window.addEvent) return;
	var preload = function(){
		if (window.dbug) dbug.log('preloading clientcide css');
		if (!Clientcide.preloaded) Clientcide.preLoadCss();
	};
	window.addEvent('domready', preload);
	window.addEvent('load', preload);
})();
setCNETAssetBaseHref = Clientcide.setAssetLocation;

/*
Script: dbug.js
	A wrapper for Firebug console.* statements.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var dbug = {
	logged: [],	
	timers: {},
	firebug: false, 
	enabled: false, 
	log: function() {
		dbug.logged.push(arguments);
	},
	nolog: function(msg) {
		dbug.logged.push(arguments);
	},
	time: function(name){
		dbug.timers[name] = new Date().getTime();
	},
	timeEnd: function(name){
		if (dbug.timers[name]) {
			var end = new Date().getTime() - dbug.timers[name];
			dbug.timers[name] = false;
			dbug.log('%s: %s', name, end);
		} else dbug.log('no such timer: %s', name);
	},
	enable: function(silent) { 
		var con = window.firebug ? firebug.d.console.cmd : window.console;

		if((!!window.console && !!window.console.warn) || window.firebug) {
			try {
				dbug.enabled = true;
				dbug.log = function(){
						(con.debug || con.log).apply(con, arguments);
				};
				dbug.time = function(){
					con.time.apply(con, arguments);
				};
				dbug.timeEnd = function(){
					con.timeEnd.apply(con, arguments);
				};
				if(!silent) dbug.log('enabling dbug');
				for(var i=0;i<dbug.logged.length;i++){ dbug.log.apply(con, dbug.logged[i]); }
				dbug.logged=[];
			} catch(e) {
				dbug.enable.delay(400);
			}
		}
	},
	disable: function(){ 
		if(dbug.firebug) dbug.enabled = false;
		dbug.log = dbug.nolog;
		dbug.time = function(){};
		dbug.timeEnd = function(){};
	},
	cookie: function(set){
		var value = document.cookie.match('(?:^|;)\\s*jsdebug=([^;]*)');
		var debugCookie = value ? unescape(value[1]) : false;
		if((!$defined(set) && debugCookie != 'true') || ($defined(set) && set)) {
			dbug.enable();
			dbug.log('setting debugging cookie');
			var date = new Date();
			date.setTime(date.getTime()+(24*60*60*1000));
			document.cookie = 'jsdebug=true;expires='+date.toGMTString()+';path=/;';
		} else dbug.disableCookie();
	},
	disableCookie: function(){
		dbug.log('disabling debugging cookie');
		document.cookie = 'jsdebug=false;path=/;';
	}
};

(function(){
	var fb = !!window.console || !!window.firebug;
	var con = window.firebug ? window.firebug.d.console.cmd : window.console;
	var debugMethods = ['debug','info','warn','error','assert','dir','dirxml'];
	var otherMethods = ['trace','group','groupEnd','profile','profileEnd','count'];
	function set(methodList, defaultFunction) {
		for(var i = 0; i < methodList.length; i++){
			dbug[methodList[i]] = (fb && con[methodList[i]])?con[methodList[i]]:defaultFunction;
		}
	};
	set(debugMethods, dbug.log);
	set(otherMethods, function(){});
})();
if ((!!window.console && !!window.console.warn) || window.firebug){
	dbug.firebug = true;
	var value = document.cookie.match('(?:^|;)\\s*jsdebug=([^;]*)');
	var debugCookie = value ? unescape(value[1]) : false;
	if(window.location.href.indexOf("jsdebug=true")>0 || debugCookie=='true') dbug.enable();
	if(debugCookie=='true')dbug.log('debugging cookie enabled');
	if(window.location.href.indexOf("jsdebugCookie=true")>0){
		dbug.cookie();
		if(!dbug.enabled)dbug.enable();
	}
	if(window.location.href.indexOf("jsdebugCookie=false")>0)dbug.disableCookie();
}

/*
Script: ToElement.js
	Defines the toElement method for a class.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
Class.ToElement = new Class({
	toElement: function(){
		return this.element;
	}
});
var ToElement = Class.ToElement;

/*
Script: StyleWriter.js

Provides a simple method for injecting a css style element into the DOM if it's not already present.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

var StyleWriter = new Class({
	createStyle: function(css, id) {
		window.addEvent('domready', function(){
			try {
				if (document.id(id) && id) return;
				var style = new Element('style', {id: id||''}).inject($$('head')[0]);
				if (Browser.Engine.trident) style.styleSheet.cssText = css;
				else style.set('text', css);
			}catch(e){dbug.log('error: %s',e);}
		}.bind(this));
	}
});

/*
Script: DatePicker.js
	Allows the user to enter a date in many popuplar date formats or choose from a calendar.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var DatePicker;
(function(){
  
  DatePicker = new Class({
    Implements: [Options, Events, StyleWriter],
    options: {
      format: "%x",
      defaultCss: 'div.calendarHolder table.cal {margin-right: 15px !important;margin-right: 8px;width: 205px;}'+
        'div.calendarHolder td {text-align:center;}'+
        'div.calendarHolder tr.dayRow td {padding: 2px;width: 22px;cursor: pointer;}'+
        'div.calendarHolder table.datePicker * {font-size:11px;line-height:16px;}'+
        'div.calendarHolder table.datePicker {margin: 0;padding:0 5px;float: left;}'+
        'div.calendarHolder table.datePicker table.cal td {cursor:pointer;}'+
        'div.calendarHolder tr.dateNav {font-weight: bold;height:22px;margin-top:8px;}'+
        'div.calendarHolder tr.dayNames {height: 23px;}'+
        'div.calendarHolder tr.dayNames td {color:#666;font-weight:700;border-bottom:1px solid #ddd;}'+
        'div.calendarHolder table.datePicker tr.dayRow td:hover {background:#ccc;}'+
        'div.calendarHolder table.datePicker tr.dayRow td {margin: 1px;}'+
        'div.calendarHolder td.today {color:#bb0904;}'+
        'div.calendarHolder td.otherMonthDate {border:1px solid #fff;color:#ccc;background:#f3f3f3 !important;margin: 0px !important;}'+
        'div.calendarHolder td.selectedDate {border: 1px solid #20397b;background:#dcddef;margin: 0px !important;}'+
        'div.calendarHolder a.leftScroll, div.calendarHolder a.rightScroll {cursor: pointer; color: #000}'+
        'div.datePickerSW div.body {height: 160px !important;height: 149px;}'+
        'div.datePickerSW .clearfix:after {content: ".";display: block;height: 0;clear: both;visibility: hidden;}'+
        'div.datePickerSW .clearfix {display: inline-table;}'+
        '* html div.datePickerSW .clearfix {height: 1%;}'+
        'div.datePickerSW .clearfix {display: block;}',
      calendarId: false,
      updateOnBlur: true,
      additionalShowLinks: [],
      showOnInputFocus: true,
      useDefaultCss: true,
      hideCalendarOnPick: true,
      weekStartOffset: 0,
      showMoreThanOne: true,
    },
    
    
    initialize: function(element, options) 
    {
      this.today = new Date();
      this.setOptions(options);
      if (this.options.useDefaultCss) this.createStyle(this.options.defaultCss, 'datePickerStyle');

      this.whens = this.whens || ['start'];
      if(this.options.whens) this.whens = this.whens.combine(this.options.when);
      
      if (!this.calendarId) this.calendarId = "popupCalendar" + new Date().getTime();
      var calendar = this.getCalendar();
      this.show()
      calendar.inject(element)
    },

    
    calWidth: 280,
    inputDates: {},
    selectedDates: {},
    
    
    getDates: function(dates, getFromInputs)
    {
      SSLog('getDates >>>>>>>>>>>>>>>>> ', SSLogForce);
      SSLog(this.selectedDates, SSLogForce);
      var d = {};
      if (!getFromInputs) dates = dates || this.selectedDates;
      this.whens.each(function(when) {
        switch($type(dates))
        {
          case "object":
            if (dates) d[when] = dates[when] ? dates[when] : when;
            break;
          default:
            break;
        }
        if (!d[when]) d[when] = this.selectedDates[when] || new Date();
      }, this);
      return d;
    },
    
    
    validDate: function(val) 
    {
      if (!$chk(val)) return null;
      var date = Date.parse(val.trim());
      return isNaN(date)?null:date;
    },
    
    
    formatDate: function (date) 
    {
      return date.format(this.options.format);
    },
    
    
    getCalendar: function() 
    {
      if (!this.calendar) 
      {
        var cal = new Element("table", {
          'id': this.options.calendarId || '',
          'border':'0',
          'cellpadding':'0',
          'cellspacing':'0',
          'class':'datePicker'
        });
        var tbody = new Element('tbody').inject(cal);
        var rows = [];
        (8).times(function(i){
          var row = new Element('tr').inject(tbody);
          (7).times(function(i){
            var td = new Element('td').inject(row).set('html', '&nbsp;');
          });
        });
        var rows = tbody.getElements('tr');
        rows[0].addClass('dateNav');
        rows[1].addClass('dayNames');
        (6).times(function(i){
          rows[i+2].addClass('dayRow');
        });
        this.rows = rows;
        var dayCells = rows[1].getElements('td');
        dayCells.each(function(cell, i){
          cell.firstChild.data = Date.getMsg('days')[(i + this.options.weekStartOffset) % 7].substring(0,3);
        }, this);
        [6,5,4,3].each(function(i){ rows[0].getElements('td')[i].dispose() });
        this.prevLnk = rows[0].getElement('td').setStyle('text-align', 'right');
        this.prevLnk.adopt(new Element('a').set('html', "&lt;").addClass('rightScroll'));
        this.month = rows[0].getElements('td')[1];
        this.month.set('colspan', 5);
        this.nextLnk = rows[0].getElements('td')[2].setStyle('text-align', 'left');
        this.nextLnk.adopt(new Element('a').set('html', '&gt;').addClass('leftScroll'));
        cal.addEvent('click', this.clickCalendar.bind(this));
        this.calendar = cal;
        this.container = new Element('div').adopt(cal).addClass('calendarHolder');
      }
      return this.calendar;
    },
    
    
    show: function()
    {
      this.selectedDates = {};
      var dates = this.getDates(null, true);
      
      SSLog('>>>>>>>>>>>>>>>>>>>> DatePicker Calendar', SSLogForce);
      SSLog(dates, SSLogForce);
      
      this.whens.each(function(when){
        this.selectedDates[when] = when == 'start' ? this.today : new Date(when)
        this.getCalendar(when);
      }, this);
      
      this.fillCalendar(this.selectedDates.start);

      this.fireEvent('onShow');
      return this;
    },
    
    
    handleScroll: function(e)
    {
      if (e.target.hasClass('rightScroll')||e.target.hasClass('leftScroll')) 
      {
        var newRef = e.target.hasClass('rightScroll')
          ?this.rows[2].getElement('td').refDate - Date.units.day()
          :this.rows[7].getElements('td')[6].refDate + Date.units.day();
        this.fillCalendar(new Date(newRef));
        return true;
      }
      return false;
    },
    
    
    setSelectedDates: function(e, newDate)
    {
      this.selectedDates.start = newDate;
    },
    
    
    onPick: function()
    {
      this.updateSelectors();
      this.inputs.each(function(input) {
        input.fireEvent("change");
        input.fireEvent("blur");
      });
      this.fireEvent('onPick');
      if (this.options.hideCalendarOnPick) this.hide();
    },
    
    
    clickCalendar: function(e) 
    {
      if (this.handleScroll(e)) return;
      if (!e.target.firstChild || !e.target.firstChild.data) return;
      var val = e.target.firstChild.data;
      if (e.target.refDate) {
        var newDate = new Date(e.target.refDate);
        this.setSelectedDates(e, newDate);
        this.updateInput();
        this.onPick();
      }
    },
    
    
    fillCalendar: function (date) 
    {
      if ($type(date) == "string") date = new Date(date);
      var startDate = (date)?new Date(date.getTime()):new Date();
      var hours = startDate.get('hours');
      startDate.setDate(1);
      startDate.setTime((startDate.getTime() - (Date.units.day() * (startDate.getDay()))) + 
                        (Date.units.day() * this.options.weekStartOffset));
      var monthyr = new Element('span', {
        html: Date.getMsg('months')[date.getMonth()] + " " + date.getFullYear()
      });
      document.id(this.rows[0].getElements('td')[1]).empty().adopt(monthyr);
      var atDate = startDate.clone();
      this.rows.each(function(row, i){
        if (i < 2) return;
        row.getElements('td').each(function(td){
          atDate.set('hours', hours);
          td.firstChild.data = atDate.getDate();
          td.refDate = atDate.getTime();
          atDate.setTime(atDate.getTime() + Date.units.day());
        }, this);
      }, this);
      this.updateSelectors();
    },
    
    
    updateSelectors: function()
    {
      var atDate;
      var month = new Date(this.rows[5].getElement('td').refDate).getMonth();
      this.rows.each(function(row, i) {
        if (i < 2) return;
        row.getElements('td').each(function(td){
          td.className = '';
          atDate = new Date(td.refDate);
          if (atDate.format("%x") == this.today.format("%x")) td.addClass('today');
          this.whens.each(function(when){
            var date = this.selectedDates[when];
            if (date && atDate.format("%x") == date.format("%x")) {
              td.addClass('selectedDate');
              this.fireEvent('selectedDateMatch', [td, when]);
            }
          }, this);
          this.fireEvent('rowDateEvaluated', [atDate, td]);
          if (atDate.getMonth() != month) td.addClass('otherMonthDate');
          atDate.setTime(atDate.getTime() + Date.units.day());
        }, this);
      }, this);
    }
  });
})();
