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
                  Sandalphon is a internal tool for developing UI components to be used from within ShiftSpace.
                </p>
            </div>
            <br />
            <div class="section">
                <h3>Developing UI components</h3>
                <div class="content">
                   <p>Placeholder</p>
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
            
            <h2 id="concepts">Core Builder</h2>
            <div class="content">
                <p>
                  The Core Builder script looks at every file within <b>$SHIFTSPACE_ROOT</b> for a builder description.
                  this script is can be found at <b>$SHIFTSPACE_ROOT/builder/corebuilder.py</b>.
                </p>
            </div>
            <br />
            <div class="section">
                <h3>Developing UI components</h3>
                <div class="content">
                   <p>Placeholder</p>
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
