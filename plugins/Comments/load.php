<?php 

if (!empty($_REQUEST['shiftId'])) 
{
  $shiftId = $db->escape($_REQUEST['shiftId']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}

// grab the real shift id
$qry = "
  SELECT s.space, s.summary, s.href, u.username, s.id
  FROM shift s, user u
  WHERE s.url_slug='$shiftId'
  AND s.user_id = u.id
";
$shift = $db->row($qry);

// grab all comments for this shift
$qry = "
  SELECT c.content, u.username, c.created, c.modified
  FROM comment c, user u
  WHERE u.id = c.user_id
  AND c.shift_id = $shift->id
  ORDER BY c.created ASC
";
$comments = $db->rows($qry);

$allComments = '';
for($i = 0; $i < count($comments); $i++)
{
  $currentComment = $comments[$i];
  $num = $i + 1;
  $date = ucfirst(elapsed_time($currentComment->created));
  $newComment = "	
    <li id='com-2' class='comment original'>
  		<div class='com-meta'>
  			<div class='com-meta-text'>
  				<span class='com-num'>$num. </span><a class='com-author' href='#'>$currentComment->username</a> said <span class='time-ago'>($date)</span>:
  			</div>
  			<a href='' class='com-author'>
  				<img src='http://www.gravatar.com/avatar.php?gravatar_id=67664b0311adf87957b7addb332f576e&size=33.jpg'/>
  			</a>
  		</div>
  		<div class='com-content'>
  			$currentComment->content
  		</div>
  	</li>";
  
  // append the markup of the new comment
  $allComments .= $newComment;
}

$commentsHTML = "
<div id='SSComments' style='width:auto;'>
<a class='com-reply' href='#' title='Reply to this thread'>Reply</a>
<ul id='com-list'>
	<li id='com-1' class='comment shift original'>
		<div class='com-meta'>
			<div class='com-meta-text'>
				<a class='com-author' href='#'>$shift->username</a>'s <span class='space-name'>$shift->space shift</span> on <span class='shifted-page'>$shift->href</span>:
			</div>
			<a href='' class='com-author'>
				<img src='http://www.gravatar.com/avatar.php?gravatar_id=67664b0311adf87957b7addb332f576e&size=33.jpg'/>
			</a>
		</div>
		<div class='com-content'>'$shift->summary'</div>
		<a href='#' class='com-shift-thumb' title='view the shift'>
			<img src='http://api.shiftspace.org/images/thumbs/9ece4a8e8472aced21251137e6aef490?notes' alt='notes'/>
		</a>
	</li>
					
  $allComments
</ul>

<div id='respond'>
	<h3>Hey $user->username, post a comment!</h3>
	<textarea tabindex='6' rows='8' cols='35' name='comment' id='comment-reply'></textarea>
	<input type='submit' tabindex='7' value='Post Comment' class='button' name='submit' id='submit'/>
</div>

</div>";

$json = array();

$json['count'] = count($comments);
$json['data'] = $comments;
$json['html'] = $commentsHTML;

echo json_encode($json);

?>