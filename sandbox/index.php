<?php

$base_url = '';
if (preg_match('/shifts\/([a-z0-9]+)/', $_SERVER['REQUEST_URI'], $matches)) {
  $_GET['id'] = $matches[1];
  $base_url = '/api/sandbox/';
}

if (!empty($_GET['id'])) {
  require_once 'simple_proxy.php';
  exit;
}

shell_exec("python ../sandalphon/sandalphon.py -i ../client/views/SSConsole/SSConsole.html -o ../client/compiledViews/ -e mydev");
shell_exec("python ../builder/preprocess.py -e mydev -i ../client/ShiftSpace.js -p sandbox -o ../builds/shiftspace.sandbox.js;");

$path = explode('/', $_SERVER['REQUEST_URI']);
array_pop($path);
array_pop($path);
$path = implode('/', $path);
$server = "http://{$_SERVER['HTTP_HOST']}$path/";

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"></meta>
    <title>ShiftSpace Sandbox</title>
    <link rel="stylesheet" href="style.css" type="text/css"></link>
    <script src="../externals/jquery-1.3.2.js" type="text/javascript" charset="utf-8"></script>
    <script src="../externals/mootools-1.2.3-core.js" type="text/javascript"></script>
    <script src="../externals/mootools-1.2.3.1-more.js" type="text/javascript"></script>

    <script src="install.js" type="text/javascript" charset="utf-8"></script>
    <script src="../client/Videobox.js" type="text/javascript"></script>
    <script src="../builds/shiftspace.sandbox.js" type="text/javascript"></script>
    <style type="text/css">
    .first
    {
      margin-top:100px;
    }
    </style>
  </head>
  <body>
    <div id="install">
      Install dev userscript
    </div>
    <div id="lipsum">
      <img src="logo.png" alt="logo"></img>
      <ul id="testdata" moma:metadata="event:26">
        <li class="foo0">first one</li>
        <li class="foo1">second two</li>
        <li class="foo2">third three</li>
        <li class="2foo">fourth four</li>
      </ul>
      <script type="text/javascript">/*javascript comment*/</script>
      <p>In <a title="Publishing" href="http://en.wikipedia.org/wiki/Publishing">publishing</a> and <a title="Graphic design" href="http://en.wikipedia.org/wiki/Graphic_design">graphic design</a>, <b>lorem ipsum</b> is common <a title="Placeholder text" class="mw-redirect" href="http://en.wikipedia.org/wiki/Placeholder_text">placeholder text</a> used to demonstrate the <a title="Graphics" href="http://en.wikipedia.org/wiki/Graphics">graphic</a> elements of a document or visual presentation, such as <a title="Font" href="http://en.wikipedia.org/wiki/Font">font</a>, <a title="Typography" href="http://en.wikipedia.org/wiki/Typography">typography</a>, and <a title="Layout" href="http://en.wikipedia.org/wiki/Layout">layout</a>. It is a form of "<a title="Greeking" href="http://en.wikipedia.org/wiki/Greeking">greeking</a>".</p>
      <p>Even though using "lorem ipsum" often arouses curiosity due to its resemblance to classical <a title="Latin" href="http://en.wikipedia.org/wiki/Latin">Latin</a>, it is not intended to have meaning. Where text is visible in a document, people tend to focus on the textual content rather than upon overall presentation, so publishers use <i>lorem ipsum</i> when displaying a <a title="Typeface" href="http://en.wikipedia.org/wiki/Typeface">typeface</a> or design in order to direct the focus to presentation. "Lorem ipsum" also approximates a typical <a title="Letter frequencies" href="http://en.wikipedia.org/wiki/Letter_frequencies">distribution of letters</a> in <a title="English language" href="http://en.wikipedia.org/wiki/English_language">English</a>.</p>
      <p>The background photo was taken by <a href="http://flickr.com/photos/milesh/72387927/">Miles Hunter</a>, available under an <a href="http://creativecommons.org/licenses/by-nc/2.0/deed.en">Attribution-Noncommercial</a> Creative Commons license.</p> 
    </div>
    
  </body>
</html>
