<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>The ShiftSpace Manual &mdash; Installation Guide</title>
    <link rel="stylesheet" href="manual.css" type="text/css" />
    <script src="mootools.js" type="text/javascript"></script></script>
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
            <h1>Installation Guide</h1>
            <h2 id="introduction">Introduction</h2>
            <div class="content">
                <p>This document will explain how to configure your own ShiftSpace server. This will enable you to develop your own Spaces or hack on the core platform itself. If you have any difficulties along the way, please consult one of our <a href="http://community.shiftspace.org/">email discussion lists</a>. If you just want to install ShiftSpace (the client userscript) you don't need to follow these directions, just go to <a href="http://shiftspace.org/">ShiftSpace.org</a> and click the install button.</p>
            </div>
            <br />
            <div class="section">
                <h3>For the Impatient</h3>
                <div class="content">
                    <ol>
                        <li>Unpack <a href="http://shiftspace.org/releases/nightly.zip">the files</a> into a public web directory.</li>
                        <li>Load shiftspace.php and follow directions on the page.</li>
                        <li>Install the developer userscript and disable any other ShiftSpace userscripts.</li>
                    </ol>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Prerequisites</h3>
                <div class="content">
                    <p>If you already have the following software installed, you can safely skip to <a href="#download-source">step 2</a>. If you're not sure, you can <a href="#checking-your-installation">check your environment</a> to see if you have things set up appropriately.</p>
                    <ul>
                        <li>Apache web server</li>
                        <li>
                            PHP 5.2
                            <ul>
                                <li>pdo_sqlite extension</li>
                            </ul>
                        </li>
                        <li>
                            Firefox web browser
                            <ul>
                                <li><a href="https://addons.mozilla.org/en-US/firefox/addon/748">Greasemonkey extension</a></li>
                                <li>Firebug extension</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <br />
            </div>
            <h2 id="setup-environment">1. Set up your environment</h2>
            <div class="content">
                <p>This section will explain how to set up a development environment for ShiftSpace on your computer. We currently have instructions for Mac OS X and Windows. If there is a demand, we will add instructions for Linux (or other systems) too.</p>
            </div>
            <br />
            <div class="section">
                <h3>Mac OS X 10.4 &ldquo;Tiger&rdquo;</h3>
                <div class="content">
                    <p>Mac OS 10.4 already has Apache installed&mdash;it's just a matter of enabling it.
                    Go to the Sharing pane of the System Preferences. In the Services tab, enable
                    the checkbox for "Personal Web Sharing".</p>
                    <img src="images/personal-web-sharing.png" alt="Personal Web Sharing" class="figure" />
                    <p>Now you just need to get PHP installed and configured. We prefer the pre-compiled
                    distribution by <a href="http://entropy.ch/">Marc Liyanage</a>. Download <a href="http://www.entropy.ch/software/macosx/php/#install">the latest
                    PHP module for Apache 1.3</a>. Marc recommends avoiding Stuffit Expander when unpacking the installer, so ctrl-click it and choose "Open With" and then "BOMArchiveHelper.App". Double-click the file entropy-php.mpkg and follow the steps to install PHP.</p> 
                    <p>In order to get PHP running on Apache, you'll need to change its configuration file. Open the Terminal and enter the following:</p>
                    <pre>sudo nano /etc/httpd/httpd.conf</pre>
                    <p>You will be prompted for your password since you'll be editing this file as <a href="http://en.wikipedia.org/wiki/Superuser">root</a>. Jump to the last line of the file with the keyboard command ctrl-W and then ctrl-V. Add this to the very bottom of the file:</p>
                    <pre>Include /usr/local/php5/entropy-php.conf</pre>
                    <p>Exit from nano by pressing ctrl-X, choosing Y to save the file, then pressing enter to accept the previous filename.</p>
                    <p>In order for the new PHP software to take effect you will need to restart Apache. You can either do this by unchecking the
                    "Personal Web Sharing" checkbox from earlier and then checking it back on, or issuing the following command from the Terminal:</p>
                    <pre>sudo apachectl restart</pre>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Mac OS X 10.5 &ldquo;Leopard&rdquo;</h3>
                <div class="content">
                    <p>Mac OS 10.5 already has all the software you need, you just need to enable it. First we'll configure your pre-installed Apache server to use the bundled PHP module. Open up the Terminal and enter the following command: (followed by enter)</p>
                    <pre>sudo nano /etc/apache2/httpd.conf</pre>
                    <p>Press ctrl-W and search for <em>php</em>. Uncomment the line <tt>LoadModule php5_module</tt> by removing the <tt>#</tt> from the start of the line. Save your changes by pressing ctrl-X, then choosing Y and pressing enter.</p>
                    <p>Now you just need to turn Apache on. Go to the Sharing pane of the System Preferences. In the Services tab, enable the checkbox for "Personal Web Sharing". That's it!</p>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Windows XP</h3>
                <div class="content">
                    <p>Currently we only have documentation for Windows XP, with service pack 2 installed. We'd love to hear if somebody gets ShiftSpace running on Windows Vista or another version of Windows, but unfortunately we currently only have access to an XP machine.</p>
                    <p>First, go to the <a href="http://httpd.apache.org/">Apache website</a> and click on the link <a href="http://httpd.apache.org/download.cgi">"from a mirror"</a> that appears below <em>Download!</em>. Next, scroll down the page and click "Other files". Next choose "Binaries" and then "win32". You should see a directory listing of Windows Apache installers. Choose the latest 2.0.x MSI file (no SSL is fine) and save it to your disk.</p>
                    <img src="images/win-apache-download.gif" alt="Downloading Apache" class="figure" />
                    <p>Next, go to the <a href="http://php.net/">PHP website</a> and click on the <a href="http://www.php.net/downloads.php">Downloads</a> link. Click on the link for the the latest Windows installer of version 5.2.x and click on a suggested mirror to download from.</p>
                    <img src="images/win-php-download.gif" alt="Downloading Apache" class="figure" />
                    <p>Double click on the Apache installer and choose the following:</p>
                    <ol>
                        <li>Click <em>next</em> past the introduction</li>
                        <li>Accept the license agreement and click <em>next</em> past the readme</li>
                        <li>Accept the default settings, along with port 80</li>
                        <li>Choose the "typical" settings</li>
                        <li>Accept the default install folder</li>
                        <li>Click the <em>install</em> button, then <em>finish</em></li>
                    </ol>
                    <p>Launch the PHP installer and choose the following:</p>
                    <ol>
                        <li>Click <em>next</em> past the introduction</li>
                        <li>Accept license and click <em>next</em></li>
                        <li>Accept the default install folder</li>
                        <li>Choose "Apache 2.0.x module" and click <em>next</em></li>
                        <li>Click the <em>browse</em> button and find the configuration directory where you just installed Apache, probably <tt>C:\Program Files\Apache Group\Apache2\conf</tt>, then click <em>next</em></li>
                        <li>Expand the "Extensions" install option, scroll down to PDO, expand it, then enable the "PDO driver for SQLite". Click <em>next</em>.</li>
                        <li>Click <em>install</em>, then <em>finish</em></li>
                    </ol>
                    <p>Now you need to restart Apache so that it will be configured to use PHP. From your Start menu choose All programs &rarr; Apache HTTP Server 2.0.x &rarr; Control Apache Server &rarr; Restart.</p>
                    <img src="images/win-apache-restart.gif" alt="Restart Apache" class="figure" />
                    <p>Now you should be all set up with a local Apache + PHP development environment, which is serving files from <tt>C:\Program Files\Apache Group\Apache2\htdocs</tt>.</p>
                </div>
                <br />
            </div>
            <div class="section">
                <h3 id="checking-your-installation">Checking your installation</h3>
                <div class="content">
                    <p>When you're done with those steps, load up the URL <a href="http://localhost/">http://localhost/</a> in your
                    browser and you should see a message confirming that Apache is running. To make
                    sure you have PHP installed correctly, you'll want to create a new file called info.php in your web root. Where is your web root?</p>
                    <ul id="where-is-web-root">
                        <li>On Mac OS X, the web root is <tt>/Library/WebServer/Documents</tt>. You can also use a folder in your home directory called Sites (which translates to <tt>http://localhost/~<em>your username</em>/</tt> in the browser)</li>
                        <li>
                        <li>On Windows, the web root is <tt>C:\Program Files\Apache Group\Apache2\htdocs</tt>.</li>
                    </ul>
                    <p>Once you've created the file in your public web root, add the following contents to it:</p>
                    <pre>&lt;?php phpinfo(); ?&gt;</pre>
                    <p>Load up the file in your browser (it should be at <tt>http://localhost/info.php</tt>). If PHP is working, you should see a bunch of configuration information and the
                    current version of PHP. You'll want to look for pdo_sqlite with a SQLite version 3.x driver and also make sure the json extension is available.</p>
                </div>
                <br />
            </div>
            <h2 id="download-source">2. Download source code</h2>
            <div class="content">
                <p>You have two options to download the ShiftSpace source code&mdash;either get the latest nightly release zip file or use
                Subversion to get the files and keep them up-to-date. The latter option is more flexible and will allow you to commit changes back to the repository once you've been granted a Subversion account.</p>
            </div>
            <br />
            <div class="section">
                <h3>The nightly build</h3>
                <div class="content">
                    <p>Download a zip file of the most recent nightly snapshot from <a href="http://shiftspace.org/releases/nightly.zip">http://shiftspace.org/releases/nightly.zip</a>. When you unzip the archive you should have a directory called <tt>shiftspace</tt> with everything you need inside it.</p>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Using Subversion</h3>
                <div class="content">
                    <p><a href="http://subversion.tigris.org/">Subversion</a> is source control software that allows you to easily download files
                    and, once you have them, keep them up-to-date with updates from other developers. It also lets you contribute code
                    back into the repository and merge your changes with those of other people.</p>
                    <p>There is a very good manual on Subversion basics <a href="http://svnbook.red-bean.com/">available here</a>. To install the Subversion software, choose an installation package from their <a href="http://subversion.tigris.org/project_packages.html">available packages</a>.</p>
                    <p>By default Subversion is controlled through the command-line. There are various GUI interfaces for Subversion, which may make it easier to get started. For Windows you might want to use <a href="http://tortoisesvn.tigris.org/">TortoiseSVN</a> and on Macs you can try <a href="http://www.lachoseinteractive.net/en/community/subversion/svnx/">svnX</a>.</p>
                    <p>Once you have Subversion installed, here is the repository URL that you can use to check out the ShiftSpace repository: <a href="http://metatron.shiftspace.org/code/trunk">http://metatron.shiftspace.org/code/trunk</a>. To download the latest files with Subversion, here's the command to use:</p>
                    <pre>svn checkout http://metatron.shiftspace.org/code/trunk</pre>
                    <p>You should see a list of files being downloaded. If you want to update them in the future, just issue this command from the source code directory:</p>
                    <pre>svn update</pre>
                    <p>If you need help with Subversion, you can always use this command:</p>
                    <pre>svn help</pre>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Move files</h3>
                <div class="content">
                    <p>Move the ShiftSpace source code directory to your public web root (if you don't know where that is, see <a href="#checking-your-installation">step 1</a>). You should be able to load up the contents of the directory in your web browser, such as <tt>http://localhost/shiftspace/</tt> or <tt>http://localhost/~<em>your username</em>/shiftspace/</tt>.</p>
                </div>
                <br />
            </div>
            <h2 id="load-status-page">3. Load the status page</h2>
            <div class="content">
                <p>The final step is to load the file <tt>shiftspace.php</tt> from the ShiftSpace source code directory. This script will tell you if there are problems with the ShiftSpace installation and make suggestions on how to fix them.</p>
            </div>
            <br />
            <div class="section">
                <h3>Directory permissions</h3>
                <div class="content">
                    <p>The status page may ask you to configure your directory permissions so that the web server can create ShiftSpace's SQLite database file. Unlike MySQL or most other database systems, SQLite stores all of its information in a single file. In order for that file to be created and configured, you'll need to adjust the permissions on ShiftSpace's directory.</p>
                    <p>In Mac OS X you can Get Info on the folder, expand the Details pane within Ownership &amp; Permissions and then choose "Read &amp; Write" for your Group as well as for Others.</p>
                    <img src="images/osx_permissions.png" alt="Mac OS X permissions" class="figure" />
                    <p>Alternatively, you can use the Terminal to change permissions like this:</p>
                    <pre>cd /path/to/shiftspace
chmod 777 .</pre>
                    <p>After following the directions on the page, reload your browser to run the check again. If all goes well, once your development is set up properly you should get a message that says "Looking good!"</p>
                </div>
                <br />
            </div>
            <div class="section">
                <h3>Security</h3>
                <div class="content">
                    <p>There are some risks involved with leaving this directory wide open permissions-wise. Once you get ShiftSpace running, you should consider tightening up the permissions to a level where PHP can write to the database but that is less permissive than "777". One solution is to add the Apache user (usually something like "www") to your user's group and only allow for group write permissions.</p>
                    <p>For public-facing servers, you should definitely move the ShiftSpace database file, <tt>shiftspace.sqlite3</tt>, to a non-public directory. On Unix-like systems, it might make sense to create a directory <tt>/var/shiftspace</tt> that is
                    owned by the Apache user and make that the location of your database file. To change the location of your database file, edit the file <tt>server/config.php</tt>.</p>
                </div>
                <br/>
            </div>
            <h2 id="install-userscript">4. Install the userscript</h2>
            <div class="content">
                <p>Once the status page determines that your development environment is ready, it should include a link at the bottom to install a developer's userscript. Click that link to get started using your local ShiftSpace installation.</p>
                <img src="images/install.gif" alt="Install userscript" class="figure" />
                <p>Be sure to disable any other ShiftSpace userscripts you might have installed previously since they will interfere with each other.</p>
                <img src="images/disable-other-userscripts" alt="Disable other userscripts" class="figure" />
                <p>To start using your newly installed ShiftSpace server and client, reload the page and press your [shift] + [space] keys!</p>
            </div>
            <br />
            <h1 class="footer">Next section: <a href="developer.html">Developer Guide</a></h1>
        </div>
        <br />
    </div>
</body>
</html>
