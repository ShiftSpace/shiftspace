<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>The ShiftSpace Manual &mdash; API Reference</title>
    <link rel="stylesheet" href="manual.css" type="text/css" />
    <script src="mootools.js" type="text/javascript"></script>
    <script src="manual.js" type="text/javascript"></script>
</head>
<body>
    <div id="container">
        <div id="top">
            <a href="http://www.shiftspace.org/" id="logo"><img src="images/shiftspace_logo.png" class="noborder"/></a>
            <div id="tagline">an open source layer above any website</div>
        </div>
        <?php include("nav.html"); ?>
        <div id="main">
            <h1>API Reference</h1>
            <h2 id="concepts">Concepts</h2>
            <div class="content">
                <p>The ShiftSpace API is written in <a href="developer.html#javascript">JavaScript</a> and is comprised of three major players, whose classes are described below:</p>
                <ul>
                    <li><a href="#shiftspace">ShiftSpace</a></li>
                    <li><a href="#shiftspace.space">ShiftSpace.Space</a></li>
                    <li><a href="#shiftspace.shift">ShiftSpace.Shift</a></li>
                </ul>
                <p>A fourth class called <a href="#shiftspace.element">ShiftSpace.Element</a> is also included, which serves as a building block for creating user interfaces.</p>
                <p>ShiftSpace is based on the <a href="http://greasespot.net/">Greasemonkey</a> platform, which is <a href="developer.html#greasemonkey">described in more detail</a> in the <a href="developer.html">Developer Guide</a>.
            </div>
            <br />
            <div class="section">
                <h3>Object Oriented</h3>
                <div class="content">
                    <p>The ShiftSpace.Space and ShiftSpace.Shift classes are meant to be derived from as super-classes. These are based on the <a href="http://www.mootools.net/">MooTools JavaScript framework</a>, which provides an <tt>extend</tt> method for creating class hierarchies.</p>
                    <p>For more information about the object oriented approach we're using, please see the <a href="developer.html#mootools">MooTools section</a> of the included <a href="developer.html">Developer Guide</a>.</p>
                </div>
                <br />
            </div>
            <div class="section">
                <h3 id="method-types">Method types</h3>
                <div class="content">
                    <p>When you create Space and Shift sub-classes, there are certain methods that are implemented in the super-class, but designed to be overridden. We denote these in this document as <em>abstract</em> methods. There are also optional methods that, if defined, can serve as callbacks when certain conditions are met. We denote these methods in the documentation as <em>optional</em>. Some methods must be defined in order for your class to operate, which are denoted as <em>required</em>.</p>
                    <p>If a method in the documentation is not described in these terms, its intended use is just like that of any other method &mdash; you can call it on your derived instance objects as a helper.</p>
                </div>
                <br />
            </div>
            <h2 id="shiftspace">ShiftSpace</h2>
            <div class="content">
                <p>This is the eponymous controller object for the ShiftSpace client. Most of its functionality is hidden within a closure that prevents private methods and data from being accessed by Spaces or other external objects. Only the public methods are listed here.</p>
            </div>
            <br />
            <div class="properties">
                <h3>Methods</h3>
                <dl>
                    <dt class="alt"><a href="#ShiftSpace.info()">info()</a></dt>
                    <dd class="alt">Provides basic information about ShiftSpace's current state.</dd>
                    <br />
                    <dt><a href="#ShiftSpace.installSpace()">installSpace()</a></dt>
                    <dd>Manually installs a new Space.</dd>
                    <br />
                    <dt class="alt"><a href="#ShiftSpace.uninstallSpace()">uninstallSpace()</a></dt>
                    <dd class="alt">Manually removes an installed Space.</dd>
                    <br />
                </dl>
            </div>
            <div class="section">
                <h3>Debug mode tip</h3>
                <div class="content">
                    <p>The ShiftSpace methods can be accessed from the Firebug JavaScript console when debug mode is enabled. If your userscript is called "ShiftSpace (developer)" then debug mode is enabled by default.</p>
                    <p>In addition to these methods, you can also access each installed space as a property of ShiftSpace. For instance the Notes space object can be accessed directly with <tt>ShiftSpace.NotesSpace</tt>.</p>
                    <p>Be careful where you use ShiftSpace in debug mode &mdash; the increased flexibility comes at the cost of security. Be sure to disable the ShiftSpace developer userscript for untrusted sites. For more discussion on these security implications, refer to the <a href="http://wiki.greasespot.net/Security">security page</a> of the Greasemonkey wiki.</p>
                </div>
            </div>
            <br />
            <h2 class="method" id="ShiftSpace.info()">ShiftSpace.info()</h2>
            <div class="content">
                <p>Provides basic information about ShiftSpace's current state. If an optional <tt>spaceName</tt> argument is provided, it returns information about the Space.</p>
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl>
                        <dt>spaceName</dt>
                        <dd>(optional) If specified, returns information about a specific installed space.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>var generalInfo = ShiftSpace.info();
var notesInfo = ShiftSpace.info('Notes');</pre>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Returns</h3>
                <div class="content">
                    <p>When no <tt>spaceName</tt> is specified, returns an object with the properties:</p>
                    <dl class="arguments">
                        <dt>server</dt>
                        <dd>The base URL of the ShiftSpace server.</dd>
                        <br />
                        <dt>spaces</dt>
                        <dd>A list of installed spaces.</dd>
                        <br />
                        <dt>version</dt>
                        <dd>ShiftSpace's version.</dd>
                        <br />
                    </dl>
                    <p>When a <tt>spaceName</tt> is specified, returns an object with a list of Space attributes:</p>
                    <dl class="arguments">
                        <dt>title</dt>
                        <dd>A more human-readable space name.</dd>
                        <br />
                        <dt>url</dt>
                        <dd>The source URL of the space.</dd>
                        <br />
                        <dt>icon</dt>
                        <dd>The space icon's image file URL.</dd>
                        <br />
                        <dt>version</dt>
                        <dd>The Space's version.</dd>
                        <br />
                        <dt>css</dt>
                        <dd>If specified, the URL of the space's CSS file.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <h2 class="method" id="ShiftSpace.installSpace()">ShiftSpace.installSpace()</h2>
            <div class="content">
                <p>Loads the JavaScript source code of a Space, executes it and keeps a record of its installation for future page loads.</p>
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl>
                        <dt>spaceName</dt>
                        <dd>The name of the space to install.</dd>
                        <br />
                        <dt>url</dt>
                        <dd>(optional) The JavaScript source file's URL. Defaults to <tt>spaces/<strong>spaceName</strong>/<strong>spaceName</strong>.js</tt> within the ShiftSpace root directory.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>ShiftSpace.installSpace('HelloWorld');</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="ShiftSpace.uninstallSpace()">ShiftSpace.uninstallSpace()</h2>
            <div class="content">
                <p>Removes a space from ShiftSpace.</p>
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl>
                        <dt>spaceName</dt>
                        <dd>The name of the space to remove.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>ShiftSpace.uninstallSpace('HelloWorld');</pre>
                </div>
                <br />
            </div>
            <h2 id="shiftspace.space">ShiftSpace.Space</h2>
            <div class="content">
                <p>An <a href="http://en.wikipedia.org/wiki/Class_(computer_science)#Categories_of_classes">abstract base class</a>, intended to be inherited from by Space classes. Provides access to the ShiftSpace controller, whose private functions are otherwise restricted to being freely accessed.</p>
            </div>
            <br />
            <div class="properties">
                <h3>Properties</h3>
                <dl>
                    <dt class="alt">shifts</dt>
                    <dd class="alt">An object that contains each shift, assigned by the shift's id.</dd>
                    <br />
                    <dt>attributes</dt>
                    <dd>An object that describes the space (see below).</dd>
                    <br />
                </dl>
            </div>
            <br />
            <div class="properties">
                <h3>Methods</h3>
                <dl>
                    <dt class="alt"><a href="#Space.showInterface()">showInterface()</a></dt>
                    <dd class="alt">(optional) Called when the space is invoked.</dd>
                    <br />
                    <dt><a href="#Space.hideInterface()">hideInterface()</a></dt>
                    <dd>(optional) Called when another space is invoked.</dd>
                    <br />
                    <dt class="alt"><a href="#Space.onCssLoaded()">onCssLoaded()</a></dt>
                    <dd class="alt">(optional) Called after the space's CSS file has been loaded.</dd>
                    <br />
                    <dt><a href="#Space.onShiftCreate()">onShiftCreate()</a></dt>
                    <dd>(optional) Called when a shift is created.</dd>
                    <br />
                    <dt class="alt"><a href="#Space.onShiftEdit()">onShiftEdit()</a></dt>
                    <dd class="alt">(optional) Called when a shift is edited.</dd>
                    <br />
                    <dt class="alt"><a href="#Space.onShiftSave()">onShiftSave()</a></dt>
                    <dd class="alt">(optional) Called when a shift is saved.</dd>
                    <br />
                    <dt><a href="#Space.onShiftDelete()">onShiftDelete()</a></dt>
                    <dd>(optional) Called when a shift is deleted.</dd>
                    <br />
                    <dt class="alt"><a href="#Space.onShiftShow()">onShiftShow()</a></dt>
                    <dd class="alt">(optional) Called when a shift is shown.</dd>
                    <br />
                    <dt><a href="#Space.onShiftHide()">onShiftHide()</a></dt>
                    <dd>(optional) Called when a shift is hidden.</dd>
                    <br />
                </dl>
            </div>
            <div class="section">
                <h3>shifts property</h3>
                <div class="content">
                    <p>An object that contains each shift, assigned by the shift's id. This property will be assigned automatically and should be treated as read-only. To access a shift object, you just need to know its id:</p>
                    <pre>var shiftObj = this.shifts[shiftId];</pre>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>attributes property</h3>
                <div class="content">
                    <p>An object that describes the space. Assigning values to this property will enable ShiftSpace to register the space at load time. The following properties are understood:</p>
                    <dl class="arguments">
                        <dt>name</dt>
                        <dd>The name of your space &mdash; this must be unique from other spaces.</dd>
                        <br />
                        <dt>icon</dt>
                        <dd>A URL to an icon image that represents your space in the Shift menu and the Console.</dd>
                        <br />
                        <dt>title</dt>
                        <dd>(optional) A human readable title for your Space. Defaults to the <tt>name</tt> attribute.</dd>
                        <br />
                        <dt>version</dt>
                        <dd>(optional) ShiftSpace uses this to keep users' Spaces up to date. Defaults to "1.0".</dd>
                        <br />
                        <dt>css</dt>
                        <dd>(optional) A link to the CSS file that you want your Shift to load. This happens automatically at load time.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <h2 class="method" id="Space.onCssLoaded()">Space.onCssLoaded()</h2>
            <div class="content">
                <p>Define this method in your space's class in order to perform tasks after the space's CSS file has been loaded.</p>
            </div>
            <br />
            <h2 class="method" id="Space.showInterface()">Space.showInterface()</h2>
            <div class="content">
                <p>If your space provides users with some kind of user interface to create shifts, you should define this method to handle displaying the interface on the page. The method will be called whenever the space is invoked.</p> 
            </div>
            <br />
            <h2 class="method" id="Space.hideInterface()">Space.hideInterface()</h2>
            <div class="content">
                <p>If your space provides users with some kind of user interface to create shifts, you should define this method to handle hiding the interface from the page. The method will be called whenever a different space is invoked.</p> 
            </div>
            <br />
            <h2 class="method" id="Space.onShiftCreate()">Space.onShiftCreate()</h2>
            <div class="content">
                <p>Define this method in your space's class in order to perform tasks whenever a new shift is created with your space. This will execute after ShiftSpace makes its call to the server.</p> 
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl>
                        <dt>shiftId</dt>
                        <dd>The id of the newly created shift. You can access it from <tt>this.shifts[shiftId]</tt>.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <h2 class="method" id="Space.onShiftEdit()">Space.onShiftEdit()</h2>
            <div class="content">
                <p>If you want a custom behavior to occur when the user edits a shift implement this method.</p> 
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl>
                        <dt>shiftId</dt>
                        <dd>The id of the shift to be edited. You can access it from <tt>this.shifts[shiftId]</tt>.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <h2 class="method" id="Space.onShiftSave()">Space.onShiftSave()</h2>
            <div class="content">
                <p>Define this method in your space's class in order to perform tasks whenever a shift is saved with your space. This will execute after ShiftSpace makes its call to the server.</p> 
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl>
                        <dt>shiftId</dt>
                        <dd>The id of the shift that was saved.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <h2 class="method" id="Space.onShiftDelete()">Space.onShiftDelete()</h2>
            <div class="content">
                <p>Define this method in your space's class in order to perform tasks whenever a shift is deleted from your space. This will execute after ShiftSpace makes its call to the server.</p> 
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl>
                        <dt>shiftId</dt>
                        <dd>The id of the shift that was deleted. This id is now expired and cannot be used to access the shift object any more.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <h2 class="method" id="Space.onShiftShow()">Space.onShiftShow()</h2>
            <div class="content">
                <p>Define this method in your space's class in order to perform tasks whenever a shift is shown with your space.</p> 
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl>
                        <dt>shiftId</dt>
                        <dd>The id of the shift that was shown. If the shift's DOM element has already been passed to the <tt><a href="#ShiftSpace.Shift.manageElement()">ShiftSpace.Shift.manageElement</a></tt> method, its visibility will be handled automatically.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <h2 class="method" id="Space.onShiftHide()">Space.onShiftHide()</h2>
            <div class="content">
                <p>Define this method in your space's class in order to perform tasks whenever a shift is hidden with your space.</p> 
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl>
                        <dt>shiftId</dt>
                        <dd>The id of the shift that was hidden. If the shift's DOM element has already been passed to the <tt><a href="#ShiftSpace.Shift.manageElement()">ShiftSpace.Shift.manageElement</a></tt> method, its visibility will be handled automatically.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <h2 id="shiftspace.shift">ShiftSpace.Shift</h2>
            <div class="content">
                <p>An <a href="http://en.wikipedia.org/wiki/Class_(computer_science)#Categories_of_classes">abstract base class</a>, intended to be inherited from by Shift classes. Provides a standard set of helper methods for Shift objects to communicate with their associated Space creators.</p>
            </div>
            <br />
            <div class="properties">
                <h3>Methods</h3>
                <dl>
                    <dt class="alt"><a href="#Shift.setup()">setup()</a></dt>
                    <dd class="alt">(abstract) The Shift class constructor.</dd>
                    <br />
                    <dt><a href="#Shift.encode()">encode()</a></dt>
                    <dd>(abstract) Generates the shift data to be saved to the server.</dd>
                    <br />
                    <dt class="alt"><a href="#Shift.manageElement()">manageElement()</a></dt>
                    <dd class="alt">(required) Specifies the DOM element that represents the shift.</dd>
                    <br />
                    <dt><a href="#Shift.getId()">getId()</a></dt>
                    <dd>Returns the id of the Shift.</dd>
                    <br />
                    <dt class="alt"><a href="#Shift.getParentSpace()">getParentSpace()</a></dt>
                    <dd class="alt">Returns the instance of the parent space.</dd>
                    <br />
                    <dt><a href="#Shift.edit()">edit()</a></dt>
                    <dd>(abstract) Put the shift in edit mode. You don't need to implement this if your the editing interaction occurs on the Space interface and not on the Shift interface.</dd>
                    <br />
                    <dt><a href="#Shift.save()">save()</a></dt>
                    <dd>Updates the shift. Implicitly calls <tt><a href="#Shift.encode()">encode()</a></tt>.</dd>
                    <br />
                    <dt class="alt"><a href="#Shift.show()">show()</a></dt>
                    <dd class="alt">(abstract) Show the shift.</dd>
                    <br />
                    <dt><a href="#Shift.hide()">hide()</a></dt>
                    <dd>(abstract) Hide the shift.</dd>
                    <br />
                    <dt class="alt"><a href="#Shift.destroy()">destroy()</a></dt>
                    <dd class="alt">(abstract) Remove the shift from the page.  </dd>
                    <br />
                </dl>
            </div>
            <h2 class="method" id="Shift.setup()">Shift.setup()</h2>
            <div class="content">
                <p>The shift's constructor. This is called when a new shift instance object is created.</p>
                <p>This is an abstract method that must be defined for your shift class to work properly. You must also call the super-class's constructor upon initialization so that certain management tasks can be handled behind the scenes. Do this by calling <tt>this.parent(json);</tt> on the first line of your constructor.</p>
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl class="arguments">
                        <dt>json</dt>
                        <dd>An object containing an initial set of values (see below).</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <div class="arguments section">
                <h3>json properties</h3>
                <div class="content">
                    <dl class="arguments">
                        <dt>id</dt>
                        <dd>A temporary ID, replaced upon saving</dd>
                        <br/>
                        <dt>space</dt>
                        <dd>The name of the parent space</dd>
                        <br />
                        <dt>username</dt>
                        <dd>The username of the author</dd>
                        <br />
                        <dt>position</dt>
                        <dd>Page coordinates where the shift was created. An object with <tt>x</tt> and <tt>y</tt> properties.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>var FooShift = ShiftSpace.Shift.extend({
    setup: function(json) {
        this.parent(json);
        // More code goes here
    }
});</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="Shift.encode()">Shift.encode()</h2>
            <div class="content">
                <p>Returns an object that specifies what values will be saved to the database. This method is invoked whenever the <tt><a href="#Shift.save()">save</a></tt> method is called.</p>
                <p>This is an abstract method that you need to define in order for your shift class to work properly. The only required property that you return is <tt>summary</tt>.</p>
            </div>
            <br />
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>encode: function() {
    return {
        summary: this.content,
        position: {
            x: this.pos.x,
            y: this.pos.y
        }
    };
}</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="Shift.manageElement()">Shift.manageElement()</h2>
            <div class="content">
                <p>Call this method to specify which DOM element represents the shift on the page. This allows ShiftSpace to show and hide your element and automatically handle the stacking order for situations where more than one shift occupy the same part of the page.</p>
                <p>This is a required method call &mdash; you must call this during the initialization of your shift.</p>
            </div>
            <br />
            <div class="arguments section">
                <h3>Arguments</h3>
                <div class="content">
                    <dl class="arguments">
                        <dt>element</dt>
                        <dd>The DOM element to manage.</dd>
                        <br />
                    </dl>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>this.manageElement(this.element);</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="Shift.getId()">Shift.getId()</h2>
            <div class="content">
                <p>Returns the id of the shift. By wrapping this in a getter (instead of accessing the property directly) we avoid the problem of forged shift ids.</p>
            </div>
            <br />
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>var myId = this.getId();</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="Shift.getParentSpace()">Shift.getParentSpace()</h2>
            <div class="content">
                <p>Retrieves the object instance of the shift's parent space.</p>
            </div>
            <br />
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>var parentSpace = this.getParentSpace();</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="Shift.edit()">Shift.edit()</h2>
            <div class="content">
                <p>Put the shift into edit mode. This is an optional method, you only need to implement this if you wish to put an editing interface directly on the shift itself.  You do not call this method directly.</p>
            </div>
            <br />
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>this.edit();</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="Shift.save()">Shift.save()</h2>
            <div class="content">
                <p>Saves the shift to the server. Implicitly calls the shift's <tt><a href="#Shift.encode()">encode</a></tt> method and then the space's <tt><a href="#Space.onShiftSave()">onShiftSace</a></tt> method, if one has been defined.</p>
            </div>
            <br />
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>this.save();</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="Shift.show()">Shift.show()</h2>
            <div class="content">
                <p>Including this in your shift class will override the default <tt>show</tt> method, which is already defined by the abstract base class. You should use this if your shift needs something more complex than having its DOM element's <tt>display</tt> style set to <tt>'block'</tt>.</p>
            </div>
            <br />
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>show: function() {
    // Fade the element in, rather than showing it all at once
    var fadeFx = new Fx.Style(this.element, 'opacity');
    fadeFx.start(0, 1.0);
}</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="Shift.hide()">Shift.hide()</h2>
            <div class="content">
                <p>Including this in your shift class will override the default <tt>hide</tt> method, which is already defined by the abstract base class. You should use this if your shift needs something more complex than having its DOM element's <tt>display</tt> style set to <tt>'none'</tt>.</p>
            </div>
            <br />
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>hide: function() {
    // Fade the element out, rather than hiding it all at once
    var fadeFx = new Fx.Style(this.element, 'opacity');
    fadeFx.start(1.0, 0);
}</pre>
                </div>
                <br />
            </div>
            <h2 class="method" id="Shift.destroy()">Shift.destroy()</h2>
            <div class="content">
                <p>Including this in your shift class will override the default <tt>destroy</tt> method, which is already defined by the abstract base class. You should use this if your shift needs something more complex than having its DOM element removed from the page.</p>
            </div>
            <br />
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>destroy: function() {
    // This shift has more than one element to remove
    this.element1.remove();
    this.element2.remove();
}</pre>
                </div>
                <br />
            </div>
            <h2 id="shiftspace.element">ShiftSpace.Element</h2>
            <div class="content">
                <p>A modified version of the <a href="http://docs.mootools.net/Native/Element.js">MooTools Element class</a>, but with additional CSS resets to prevent the page's stylesheets from effecting ShiftSpace content.</p>
            </div>
            <br />
            <div class="section">
                <h3>Methods</h3>
                <div class="content">
                    <p>This class inherits many helpful methods from the MooTools <tt>Element</tt> base class. Please refer to the <a href="http://docs.mootools.net/Native/Element.js">MooTools documentation</a> for more details.</p>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Example</h3>
                <div class="content">
                    <pre>var div = new ShiftSpace.Element('div', {
    styles: {
        position: 'absolute',
        left: 100,
        top: 100,
        background: '#FFF'
    }
});
link.appendText('Hello, world!');
link.injectInside(document.body);</pre>
                </div>
                <br />
            </div>
        </div>
        <br />
    </div>
</body>
</html>
