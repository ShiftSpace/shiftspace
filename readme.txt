ShiftSpace (http://shiftspace.org/)
An open source layer above any website

Installation Guide
------------------

This is a text-only version of the installation guide available at:
http://shiftspace.org/manual/install.html

The same documentation should also be included with this ShiftSpace software
release inside the 'manual' directory.

This document will explain how to configure your own ShiftSpace server. This
will enable you to develop your own Spaces or hack on the core platform itself.
If you have any difficulties along the way, please consult one of our email
discussion lists (http://community.shiftspace.org/). If you just want to install
ShiftSpace (the client userscript) you don't need to follow these directions,
just go to ShiftSpace.org and click the install button.

For the Impatient
-----------------

   1. Unpack the files into a public web directory.
   2. Load shiftspace.php and follow directions on the page.
   3. Install the developer userscript and disable any other ShiftSpace
      userscripts. 

Prerequisites
-------------

    * Apache web server
    * PHP 5
          - sqlite extension
          - pdo extension
          - pdo_sqlite extension
          - json extension
    * Firefox web browser
          - Greasemonkey extension
          - Firebug extension (highly recommended)


1. Set up your environment
--------------------------

This section will explain how to set up a development environment for ShiftSpace
on your computer. We currently have instructions for Mac OS X and Windows. If
you run Linux, or some other Unix variation, you're kind of on your own as far
as setting up your environment. But then again you probably know what you're
doing! Maybe some day we'll have instructions for Linux too.

    Mac OS X 10.4 “Tiger”
    ---------------------

    Mac OS 10.4 already has Apache installed -- it's just a matter of enabling it.
    Go to the Sharing pane of the System Preferences. In the Services tab,
    enable the checkbox for "Personal Web Sharing".

    Now you just need to get PHP installed and configured. We prefer a
    pre-compiled distribution by Marc Liyanage:
    
        http://www.entropy.ch/software/macosx/php/#install
    
    Download the latest PHP module for Apache 1.3. Marc recommends avoiding
    Stuffit Expander when unpacking the installer, so ctrl-click it and choose
    "Open With" and then "BOMArchiveHelper.App". Double-click the file
    entropy-php.mpkg and follow the steps to install PHP.
    
    In order to get PHP running on Apache, you'll need to change its
    configuration file. Open the Terminal and enter the following:
    
        sudo nano /etc/httpd/httpd.conf

    You will be prompted for your password since you'll be editing this file as
    root. Jump to the last line of the file with the keyboard command ctrl-W and
    then ctrl-V. Add this to the very bottom of the file:

        Include /usr/local/php5/entropy-php.conf

    Exit from nano by pressing ctrl-X, choosing Y to save the file, then
    pressing enter to accept the previous filename.

    In order for the new PHP software to take effect you will need to restart
    Apache. You can either do this by unchecking the "Personal Web Sharing"
    checkbox from earlier and then checking it back on, or issuing the following
    command from the Terminal:

        sudo apachectl restart

    Mac OS X 10.5 “Leopard”
    -----------------------

    Mac OS 10.5 already has all the software you need. Just go to the Sharing
    pane of the System Preferences. In the Services tab, enable the checkbox for
    "Personal Web Sharing". That's it!

    Windows
    -------
    
    Currently we only have documentation for Windows XP, with service pack 2
    installed. We'd love to hear if somebody gets ShiftSpace running on Windows
    Vista or another version of Windows, but unfortunately we currently only
    have access to an XP machine.

    First, go to the Apache website and click on the link "from a mirror" that
    appears below Download!. Next, scroll down the page and click "Other files".
    Next choose "Binaries" and then "win32". You should see a directory listing
    of Windows Apache installers. Choose the latest 2.0.x MSI file (no SSL is
    fine) and save it to your disk.
    
    Next, go to the PHP website and click on the Downloads link. Click on the
    link for the the latest Windows installer of version 5.2.x and click on a
    suggested mirror to download from.

    Double click on the Apache installer and choose the following:

        1. Click next past the introduction
        2. Accept the license agreement and click next past the readme
        3. Accept the default settings, along with port 80
        4. Choose the "typical" settings
        5. Accept the default install folder
        6. Click the install button, then finish

    Launch the PHP installer and choose the following:

        1. Click next past the introduction
        2. Accept license and click next
        3. Accept the default install folder
        4. Choose "Apache 2.0.x module" and click next
        5. Click the browse button and find the configuration directory where
           you just installed Apache, probably C:\Program Files\Apache Group\
           Apache2\conf, then click next
        6. Expand the "Extensions" install option, scroll down to PDO, expand
           it, then enable the "PDO driver for SQLite". Click next.
        7. Click install, then finish

        Now you need to restart Apache so that it will be configured to use PHP.
        From your Start menu choose All programs -> Apache HTTP Server 2.0.x ->
        Control Apache Server -> Restart.
        
        Now you should be all set up with a local Apache + PHP development
        environment, which is serving files from C:\Program Files\Apache
        Group\Apache2\htdocs.
    
    Checking your installation
    --------------------------

    When you're done with those steps, load up the URL http://localhost/ in your
    browser and you should see a message confirming that Apache is running. To
    make sure you have PHP installed correctly, you'll want to create a new file
    called info.php in your web root. Where is your web root?

        * On Mac OS X, the web root is /Library/WebServer/Documents. You can
          also use a folder in your home directory called Sites (which
          translates to http://localhost/~your username/ in the browser) 
        * On Windows, the web root is C:\Program Files\
          Apache Group\Apache2\htdocs.

    Once you've created the file in your public web root, add the following
    contents to it:
    
        <?php phpinfo(); ?>

    Load up the file in your browser (it should be at
    http://localhost/info.php). If PHP is working, you should see a bunch of
    configuration information and the current version of PHP. You'll want to
    look for pdo_sqlite with a SQLite version 3.x driver and also make sure the
    json extension is available.

2. Download source code
-----------------------

You have two options to download the ShiftSpace source code -- either get the
latest nightly release zip file or use Subversion to get the files files and
keep them up-to-date. The latter option is more flexible and will allow you to
commit changes back to the repository once you've been granted a Subversion
account.

    The nightly build
    -----------------

    Download a zip file of the most recent nightly snapshot from
    http://shiftspace.org/releases/nightly.zip. When you unzip the archive you
    should have a directory called shiftspace with everything you need inside
    it.

    Using Subversion
    ----------------

    Subversion is source control software that allows you to easily download
    files and, once you have them, keep them up-to-date with updates from other
    developers. It also lets you contribute code back into the repository and
    merge your changes with those of other people.

    There is a very good manual on Subversion basics available at
    http://svnbook.red-bean.com/. To install the Subversion software, choose an
    installation package from their available packages:
    http://subversion.tigris.org/project_packages.html

    By default Subversion is controlled through the command-line. There are
    various GUI interfaces for Subversion, which may make it easier to get
    started. For Windows there is TortoiseSVN and on Macs there is svnX.
    
        TortoiseSVN:
        http://tortoisesvn.tigris.org/
        
        svnX
        http://www.lachoseinteractive.net/en/community/subversion/svnx/

    Once you have Subversion installed, here is the repository URL that you can
    use to check out the ShiftSpace repository:
    http://shiftspace.org/code/branches/0.11. To download the latest files with
    Subversion, here's the command to use:

        svn checkout http://shiftspace.org/code/branches/0.11

    You should see a list of files being downloaded. If you want to update them
    in the future, just issue this command from the source code directory:
    
        svn update

    If you need help with Subversion, you can always use this command:

        svn help

    Move files
    ----------

    Move the ShiftSpace source code directory to your public web root (see step
    1 if you don't know where that is). You should be able to load up the
    contents of the directory in your web browser, such as
    http://localhost/shiftspace/ or http://localhost/~your username/shiftspace/.

3. Load the status page
-----------------------

The final step is to load the file shiftspace.php from the ShiftSpace source
code directory. This script will tell you if there are problems with the
ShiftSpace installation and make suggestions on how to fix them.

    Directory permissions
    ---------------------

    The status page may ask you to configure your directory permissions so that
    the web server can create ShiftSpace's SQLite database file. Unlike MySQL or
    most other database systems, SQLite stores all of its information in a
    single file. In order for that file to be created and configured, you'll
    need to adjust the permissions on ShiftSpace's directory.

    In Mac OS X you can Get Info on the folder, expand the Details pane within
    Ownership & Permissions and then choose "Read & Write" for your Group as
    well as for Others.

    Alternatively, you can use the Terminal to change permissions like this:
    
        cd /path/to/shiftspace
        chmod 777 .

    After following the directions on the page, reload your browser to run the
    check again. If all goes well, once your development is set up properly you
    should get a message that says "Looking good!"
    
    Security
    --------
    
    There are some risks involved with leaving this directory wide open
    permissions-wise. Once you get ShiftSpace running, you should consider
    tightening up the permissions to a level where PHP can write to the
    database but that is less permissive than "777". One solution is to add the
    Apache user (usually something like "www") to your user's group and only
    allow for group write permissions.
    
    For public-facing servers, you should definitely move the ShiftSpace
    database file, shiftspace.sqlite3, to a non-public directory. On Unix-like
    systems, it might make sense to create a directory /var/shiftspace that is
    owned by the Apache user and make that the location of your database file.
    To change the location of your database file, edit the file
    server/config.php.

4. Install the userscript
-------------------------

Once the status page determines that your development environment is ready, it
should include a link at the bottom to install a developer's userscript. Click
that link to get started using your local ShiftSpace installation. Be sure to
disable any other ShiftSpace userscripts you might have installed previously
since they will interfere with each other.

To start using your newly installed ShiftSpace, reload the page and
press [shift] + [space]!

