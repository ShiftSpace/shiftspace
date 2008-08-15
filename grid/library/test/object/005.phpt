--TEST--
GridObject - evaluate
--FILE--
<?php

include dirname(__FILE__) . '/../../object.php';
$obj = new GridObject;

echo "1. Evaluate an empty template\n";
var_dump($obj->evaluate());

echo "2. Evaluate a variable\n";
$obj->setTemplate("
  <html>
    <head>
      <title>{=title}</title>
    </head>
  </html>
");
$obj->title = 'A title';
var_dump($obj->evaluate());

echo "3. Evaluate an include\n";
file_put_contents('include.html', 'An include');
$obj->setTemplate("
  <html>
    <body>
      {+include.html}
    </body>
  </html>
");
var_dump($obj->evaluate());

echo "4. Evaluate a block\n";
$obj->setTemplate("
  <html>
    <body>
      {content}
        A block
      {/content}
    </body>
  </html>
");
$obj->content = new GridObject;
var_dump($obj->evaluate());

echo "5. Evaluate a variable inside an include inside a block\n";
file_put_contents('include.html', 'A cow says {=cow}');
$obj->setTemplate("
  <html>
    <body>
      {meadow}
        {+include.html}
      {/meadow}
    </body>
  </html>
");
$obj->meadow = new GridObject;
$obj->meadow->cow = 'moo';
var_dump($obj->evaluate());

// Clean up
unlink('include.html');

?>
--EXPECT--
1. Evaluate an empty template
string(0) ""
2. Evaluate a variable
string(72) "
  <html>
    <head>
      <title>A title</title>
    </head>
  </html>
"
3. Evaluate an include
string(60) "
  <html>
    <body>
      An include
    </body>
  </html>
"
4. Evaluate a block
string(73) "
  <html>
    <body>
      
        A block
      
    </body>
  </html>
"
5. Evaluate a variable inside an include inside a block
string(80) "
  <html>
    <body>
      
        A cow says moo
      
    </body>
  </html>
"
