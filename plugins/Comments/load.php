<?php 

if (!empty($_POST['shiftId'])) 
{
  $shiftId = $db->escape($_POST['shiftId']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}

// grab the real shift id
$rShiftId = $db->value("
  SELECT id 
  FROM shift
  WHERE url_slug='$shiftId'
");

// grab all comments for this shift
$comments = $db->rows("
  SELECT c.content, u.username
  FROM comment c, user u
  WHERE u.id = c.user_id
  AND c.shift_id = $rShiftId
  ORDER BY c.created DESC
");

$commentsHTML = "
<div id='SSComments' style='width:auto;'>
<a class='com-reply' href='#' title='Reply to this thread'>Reply</a>
<ul id='com-list'>
	<li id='com-1' class='comment shift original'>
		<div class='com-meta'>
			<div class='com-meta-text'>
				<a class='com-author' href='#'>Dphiffer the conquerer</a>\'s <span class='space-name'>Highlights</span> on <span class='shifted-page'>flickr-international.com</span>:
			</div>
			<a href='' class='com-author'>
				<img src='http://www.gravatar.com/avatar.php?gravatar_id=67664b0311adf87957b7addb332f576e&size=33.jpg'/>
			</a>
		</div>
		<div class='com-content'>'On YouTube comments and the aesthetics of proper spelling/grammer'</div>
		<a href='#' class='com-shift-thumb' title='view the shift'>
			<img src='http://api.shiftspace.org/images/thumbs/9ece4a8e8472aced21251137e6aef490?notes' alt='notes'/>
		</a>
	</li>
					
	<li id='com-2' class='comment original'>
		<div class='com-meta'>
			<div class='com-meta-text'>
				<span class='com-num'>12. </span><a class='com-author' href='#'>Transorma</a> said <span class='time-ago'>(4 hours ago)</span>:
			</div>
			<a href='' class='com-author'>
				<img src='http://www.gravatar.com/avatar.php?gravatar_id=67664b0311adf87957b7addb332f576e&size=33.jpg'/>
			</a>
		</div>
		<div class='com-content'>
			<p>I gather that the error here is by judging the platform only on its merits as a utility, as such,we have some way to go.
However another perspective is to see ShiftSpace as a general use platform, that delivers an engine on which Spaces, some of which we didn’t even conceive will come to be.</p>
			<p>Our aim is to add features and capability that will allow the tool’s experimental nature to become very easy to use. It will allow social commentary as well as original concepts to appear.</p>
			<p>Some Spaces developed have incredible use potential, FishEye has great potential as a tool for media critic and public service. When i joined the project i didn’t think about some of the developments that came about.</p>
			<p>Good ideas come to many, General use platforms have demonstrated time and time again that their strength lies in their evolution rather then the end product itself.</p>
		</div>
	</li>
</ul>

<div id='respond'>
	<h3>Hey $user->username, post a comment!</h3>
	<textarea tabindex='6' rows='8' cols='35' name='comment' id='comment-reply'></textarea>
	<input type='submit' tabindex='7' value='Post Comment' class='button' name='submit' id='submit'/>
</div>

</div>";


for($i = 0; $i < count($comments); $i++)
{
  
}

$json = array();

$json['data'] = $comments;
$json['html'] = $commentsHTML;

echo json_encode($json);

?>