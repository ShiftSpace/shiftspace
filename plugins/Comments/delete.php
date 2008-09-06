<?

if (empty($user) || empty($user->id)) 
{
  echo "{status: 0, message:'User not logged in'}";
  exit;
}

if (!empty($_POST['id'])) 
{
  $id = $db->escape($_POST['id']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}

$exists = $db->value("
  SELECT id
  FROM comment
  WHERE id = $id
");

if(!$exists)
{
  // return success
  echo "{status: 0, message:'Eror. Invalid comment id.'}";
  exit;  
}

$db->query("
  DELETE
  FROM comment
  WHERE id = $id
  ");
  
// return success
echo "{status: 1, message:'Success. Comment deleted.'}";

?>