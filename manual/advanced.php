<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>The ShiftSpace Manual &mdash; Advanced Topics</title>
    <link rel="stylesheet" href="manual.css" type="text/css" />
    <script src="mootools.js" type="text/javascript"></script>
    <script src="manual.js" type="text/javascript"></script>
</head>
<body>
    <!-- begin container -->
    <div id="container">
        <div id="top">
            <a href="http://www.shiftspace.org/" id="logo"><img src="images/shiftspace_logo.png" class="noborder"/></a>
            <div id="tagline">an open source layer above any website</div>
        </div>
        <?php include("nav.html"); ?>
        <!-- begin main -->
        <div id="main">
          
            <h1>Advanced Topics</h1>
            
            <h2 id="concepts">Sandalphon</h2>
            <div class="content">
                <p>
                  Sandalphon is a tool for developing UI components to be used from within ShiftSpace.  You can
                  load any UI component under development and test it's behaviors.  If you are interested in
                  creating custom core UI components (that not code for spaces or shifts), or you are interested 
                  in building a version of ShiftSpace that can be run on your domain without the Greasemonkey
                  plugin, then you should read this document.
                </p>
                <p>
                  Sandalphon describes the tool as well as the helper class which ShiftSpace uses to instantiates UI
                  components.  Sandalphon exists to separate logic from presentation in a project that makes heavy
                  use of Javascript.  In many Javascript frameworks the developer must either inline markup or build
                  UI elements via the DOM.
                </p>
                <p>
                  Neither of these things are good solutions for developing complex AJAX interfaces where components
                  may be embedded within other components. Building UI via the DOM
                  is dreadfullly slow, especially for things like building large tables of data with complex UI
                  behaviors.  Inlining markup in Javascript is also undesirable because it decreases code readability
                  and makes modifying interface structure particularly tedious.  It also prevents project contributors
                  who are not programmers from contributing to the interface design.
                </p>
                <p>
                  Sandalphon was created to solve these issues.  ShiftSpace in fact had these problems prior to the
                  0.5 release.  Sandalphon provides a completely new approach.  A ShiftSpace build (see the Core Builder and Custom Builds
                  sections below), includes a master table of which files and packages are available to a particular
                  ShiftSpace script. Some of these files represent controller objects for interface components.
                </p>
                <p>
                  To declare that a particular element in the markup is "backed" by a UI component you must declare
                  the class of this UI component in a custom property, <b>uiclass</b>.
                </p>
                <pre>&lt;div id=&quot;MyTabView&quot; class=&quot;SSTabView&quot; uiclass=&quot;SSTabView&quot;&gt;
...
&lt;/div&gt;</pre>
                <p>
                  This approach is akin to the NIB file system in OS X. The interface file is a self contained piece of
                  markup which defines relationships including options.  It negates the need to have large blocks of
                  code which simply instantiates objects.
                </p>
                <p>
                  One question that arises then is how does one access the Javascript controller for a particular DOM element?
                  <b>SSControllerForNode</b> will retrieve the Javascript controller associated with a particular node.
                  However in most applications there will be something akin to a main controller.  Usually this controller
                  needs access to the various components of the user interface.  To solve this problem, Sandalphon allows
                  for outlets.  Outlets are mappings from a particular element (or controller) to the controller which needs
                  to know.
                </p>
                <pre>&lt;div id=&quot;MyTabView&quot; ... uiclass=&quot;SSTabView&quot; outlet=&quot;MyApplication&quot;&gt;
...
&lt;/div&gt;</pre>
                <p>
                  The above code assumes there is an element on the page with the id MyApplication which has a backing
                  Javascript controller, the class of this object is not important.  It simply must be an element
                  which is "backed".  The outlet object which referenced will provide a hook via the requesting elements
                  CSS id.  Thus it is imperative that you assign a unique CSS id to any element or controller that you
                  want to access.  For example:
                </p>
                <pre>myAppController.MyTabView.hide(); // or
myAppController.outlets.get('MyTabView').hide();</pre>
            </div>
            <br />
            
            <div class="section">
                <h3>Digging Deeper</h3>
                <div class="content">
                   <p>
                     If you've done a fair amount of Browser programming you might be wondering how instantiation order
                     can be guaranteed, especially since DOM results might be returned out of order. There's also the issue
                     of when you can in your code reasonably expect outlets to be set.
                   </p>
                </div>
                <br />
            </div>
            
            <div class="section">
                <h3>Developing UI components</h3>
                <div class="content">
                   <p>
                     Here's a quick tutorial on using the Sandalphon tool.
                   </p>
                </div>
                <br />
            </div>
            
            <div class="section">
                <h3 id="method-types">Loading UI Components</h3>
                <div class="content">
                    <p>
                    </p>
                </div>
                <br />
            </div>
            
            <h2 id="concepts">Core Builder & Preprocessing</h2>
            <div class="content">
                <p>
                  The Core Builder script looks at every file within <b>$SHIFTSPACE_ROOT</b> for a builder description.
                  this script is can be found at <b>$SHIFTSPACE_ROOT/builder/corebuilder.py</b>.
                </p>
                <p>
                  When run it creates a master table of all files, export, and packages associated with your build.
                  You only need to run corebuilder.py when you've created a new piece of code, either a collection
                  of functions or a class that needs to be included.
                </p>
                <p>
                  preprocess.py which resides in the same folder as corebuilder.py actually takes and environment
                  file and a project file both represented as json objects and produces the actual build. For example
                  when building a ShiftSpace script to be run under GreaseMonkey you should use the build_shiftspace.php
                  script found in <b>$SHIFTSPACE_ROOT/scripts/</b> folder. Note that this scripts uses the deploy.json
                  environment file and by default use the shiftspace.json project file.
                </p>
                <p>
                  In the scripts directory there are shell scripts for producing builds of ShiftSpace that can run
                  under GreaseMonkey, outside of Greasemonkey, and also under Sandalphon.
                </p>
            </div>
            <br />
            <div class="section">
                <h3>Builder Description</h3>
                <div class="content">
                   <p>
                     Any file that you want to be included in master packages.json needs to to have a builder
                     description.  It can appear anywhere in your file but it standard to put as the very first
                     thing.  The formatting of the builder description is borrowed from the description of
                     GreaseMonkey userscripts.
                    </p>
                   <pre>// ==Builder==
// @uiclass
// @required
// @name              SSTabView
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==</pre>
                </div>
                <br />
            </div>
            <div class="section">
                <h3 id="method-types">Loading UI Components</h3>
                <div class="content">
                    <p>Placeholder</p>
                </div>
                <br />
            </div>
            
            <h2 id="concepts">Custom Builds</h2>
            <div class="content">
                <p>
                  The ShiftSpace project has been designed to run under many environment, not just under Greasemonkey.
                  You can in fact customize ShiftSpace so that only the components you want are included in your build.
                  For example, perhaps you decide that you want social features that are local to your site.  Or perhaps
                  you want to expose ShiftSpace functionality on your site without requiring users to install a plugin.
                </p>
            </div>
            <br />
            <div class="section">
                <h3>Defining a Custom Build</h3>
                <div class="content">
                   <p>
                     Builds are defined by two files. The environment file and the project file.  The environment file
                     which you created to setup your development environment defines the location of the server as
                     well as the location of the spaces directory.  It also declares globals so that the particular
                     build knows whether it is running under Greasemonkey, Website, or Sandalphon mode.  The Website
                     mode is synonymous with the sandbox.  Environment files are located in 
                     <b>$SHIFTSPACE_ROOT/config/env/</b>, project files in <b>$SHIFTSPACE_ROOT/config/proj</b>.
                   </p>
                   <p>
                     The project file defines which files should be included in your build.  By default ShiftSpace
                     includes everything.  However you can exclude any file that you want.  For the most part you
                     should not exclude core files.  In general files which are tagged @optional in their builder
                     description inform you whether the file is really required for ShiftSpace to start up.
                   </p>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Anatomy of a Project file</h3>
                <div class="content">
                   <p>
                     In order to understand project files you should make sure to read over the Core Builder section.
                     The corebuilder.py outputs by default a file called package.json in <b>$SHIFTSPACE_ROOT/config/</b>.
                     This is essentially a master table of all ShiftSpace related files in <b>$SHIFTSPACE_ROOT</b>.
                     It is simply a JSON file.  It includes a list of every file, a list of packages, and a list of exports.
                   </p>
                   <p>
                     A package is simply a list of files which are conceptually grouped together.  Each package entry
                     lists it's files in the order defined by their dependencies.  The export list defines how objects
                     should be exported.  For example the ShiftSpacePin helper class gets exported as ShiftSpace.Pin
                     for third party developers.
                   </p>
                </div>
                <br />
            </div>
            <div class="section">
                <h3 id="method-types">Loading UI Components</h3>
                <div class="content">
                    <p>Placeholder</p>
                </div>
                <br />
            </div>
        </div>
        <!-- end main -->
        <br />
    </div>
    <!-- end container -->
</body>
</html>
