 <?php
	if ($persona['id'])
	{
?>
				<h2><?= $persona['name'] ?></h2>
                <h3>created by <?= $persona['author'] ?></h3>
                <img class="detailed-view"  alt="<?= $persona['name'] ?>" persona="<?= $persona['json'] ?>" src="<?= PERSONAS_LIVE_PREFIX . '/' . url_prefix($persona['id']) ?>/preview_large.jpg" >
                
<?php
		if ($persona['description'])
		{
			$desc = preg_replace('/(https?:\/\/[^ ]+[A-Za-z0-9])/', '<a href="$1">$1</a>', $persona['description']);
?>
				<p class="description"><strong>Description:</strong> <?= $desc ?></p>
<?php
		}
?>
                <p id="buttons">
                    <a href="#" class="button" id="try-button" persona="<?= $persona['json'] ?>"><span>try it now</span><span>&nbsp;</span></a>
                </p>
                
<?php
		if ($persona['popularity'])
			print '<p class="numb-users">' . number_format($persona['popularity']) . ' active daily users</p>';
	?>
	<p><script type="text/javascript" src="http://w.sharethis.com/button/sharethis.js#publisher=df86b16e-195c-4917-ae28-61a1382ba281&amp;type=website&amp;send_services=&amp;post_services=facebook%2Cdigg%2Cdelicious%2Cybuzz%2Ctwitter%2Cstumbleupon%2Creddit%2Ctechnorati%2Cmixx%2Cblogger%2Ctypepad%2Cwordpress%2Cgoogle_bmarks%2Cwindows_live%2Cmyspace%2Cfark%2Cbus_exchange%2Cpropeller%2Cnewsvine%2Clinkedin"></script></p>
	<?php
	} else {
?>            
                <p class="description">We are unable to find this persona. Please return to the gallery and try again.</p>
<?php
	}
?>