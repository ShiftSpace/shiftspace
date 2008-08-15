--TEST--
GridObject - introspect
--FILE--
<?php

include dirname(__FILE__) . '/../../object.php';
$obj = new GridObject;

echo "1. Introspect on an empty template\n";
var_dump($obj->introspect());

echo "2. Introspect a valid block structure\n";
$obj->setTemplate("
  <html>
    <head>
      <title>{=title}</title>
    </head>
    <body>
      {content}
        <div id=\"main\">{=main}</div>
        <div id=\"sidebar\">{=sidebar}</div>
        {footer}{/footer}
      {/content}
    </body>
  </html>
");
var_dump($obj->introspect());

echo "3. Introspect an invalid block structure\n";
$obj->setTemplate("
  <html>
    <head>
      <title>{=title}</title>
    </head>
    <body>
      {content}
        <div id=\"main\">{=main}</div>
        <div id=\"sidebar\">{=sidebar}</div>
        {footer}{/footer}
    </body>
  </html>
");
try {
  var_dump($obj->introspect());
} catch (Exception $e) {
  echo "Exception caught\n";
}

echo "4. Introspect a valid include\n";
file_put_contents('valid.html', 'This is a {valid} inclusion {/valid}.');
$obj->setTemplate("
  <html>
    <head>
      <title>{=title}</title>
    </head>
    <body>
      {content}
        <div id=\"main\">{=main}</div>
        <div id=\"sidebar\">{=sidebar}</div>
      {/content}
      {+valid.html}
    </body>
  </html>
");
var_dump($obj->introspect());

echo "5. Introspect on an invalid include\n";
file_put_contents('invalid.html', 'This is an {invalid} inclusion.');
$obj->setTemplate("
  <html>
    <head>
      <title>{=title}</title>
    </head>
    <body>
      {content}
        <div id=\"main\">{=main}</div>
        <div id=\"sidebar\">{=sidebar}</div>
      {/content}
      {+invalid.html}
    </body>
  </html>
");
try {
  var_dump($obj->introspect());
} catch (Exception $e) {
  echo "Exception caught\n";
}

echo "6. Introspect on a non-existent include\n";
$obj->setTemplate("
  <html>
    <head>
      <title>{=title}</title>
    </head>
    <body>
      {content}
        <div id=\"main\">{=main}</div>
        <div id=\"sidebar\">{=sidebar}</div>
      {/content}
      {+nonexistent.html}
    </body>
  </html>
");
try {
  var_dump($obj->introspect());
} catch (Exception $e) {
  echo "Exception caught\n";
}

// Clean up
unlink('valid.html');
unlink('invalid.html');

?>
--EXPECT--
1. Introspect on an empty template
array(2) {
  ["variables"]=>
  array(0) {
  }
  ["blocks"]=>
  array(0) {
  }
}
2. Introspect a valid block structure
array(2) {
  ["variables"]=>
  array(1) {
    [0]=>
    string(5) "title"
  }
  ["blocks"]=>
  array(1) {
    ["content"]=>
    string(113) "
        <div id="main">{=main}</div>
        <div id="sidebar">{=sidebar}</div>
        {footer}{/footer}
      "
  }
}
3. Introspect an invalid block structure
Exception caught
4. Introspect a valid include
array(2) {
  ["variables"]=>
  array(1) {
    [0]=>
    string(5) "title"
  }
  ["blocks"]=>
  array(2) {
    ["content"]=>
    string(87) "
        <div id="main">{=main}</div>
        <div id="sidebar">{=sidebar}</div>
      "
    ["valid"]=>
    string(11) " inclusion "
  }
}
5. Introspect on an invalid include
Exception caught
6. Introspect on a non-existent include
Exception caught
