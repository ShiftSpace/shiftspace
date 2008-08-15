<?php

require_once dirname(__FILE__) . '/setup.php';

require_once GRID_ROOT . "/library/database.php";
require_once GRID_ROOT . "/library/object.php";
require_once GRID_ROOT . "/library/config.php";

$config = new Config(GRID_ROOT . '/config.ini');
$config->selectSection("host:{$_SERVER['HTTP_HOST']}");
$db = new Database($config->database);

$url = parse_url($_SERVER['REQUEST_URI']);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  header('Content-type: text/html; charset=utf-8');
  if (strpos('..', $url['path']) !== false) {
    throw new Exception('[Security] Possible directory escalation attempt.');
  } else if (!file_exists(POST_DIR . $url['path'])) {
    throw new Exception("[Error] Post handler {$url['path']} not found.");
  } else {
    $_SESSION['submitted'] = $_POST;
    require_once POST_DIR . $url['path'];
  }
} else {
  foreach ($config->get('index:pages') as $page_id => $regex) {
    if (preg_match($regex, $url['path'], $matches)) {
      $config->selectSection("page:$page_id");
      foreach ($matches as $n => $value) {
        $regex_var = "regex$n";
        if (isset($config->$regex_var)) {
          $value_var = $config->$regex_var;
          $config->$value_var = $value;
        }
      }
      break;
    }
  }
  if (!empty($config->script) && file_exists(GET_DIR . "/$config->script")) {
    require_once GET_DIR . "/$config->script";
  } else {
    echo "No path match.";
  }
}

?>
