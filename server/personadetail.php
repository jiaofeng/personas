<?php
# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is Personas Server
#
# The Initial Developer of the Original Code is
# Mozilla Labs.
# Portions created by the Initial Developer are Copyright (C) 2008
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#	Toby Elliott (telliott@mozilla.com)
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

	require_once 'lib/personas_constants.php';	
	require_once 'lib/personas_functions.php';	
	require_once 'lib/storage.php';
	require_once 'lib/user.php';

	$db = new PersonaStorage();
	$user = new PersonaUser();
	$username = $user->authenticate();

	$categories = $db->get_categories();
	array_unshift($categories, 'All');
	$category = null;
	
	$path = array_key_exists('PATH_INFO', $_SERVER) ? $_SERVER['PATH_INFO'] : '/';
	$path = substr($path, 1); #chop the lead slash
	list($persona_id) = explode('/', $path);
	$page_header = _("View Personas");
	
	if (!is_numeric($persona_id))
		$persona_id = null;
	else
	{
		$persona_id = intval($persona_id);
		$persona = $db->get_persona_by_id($persona_id);
		if ($persona['status'] == 1)
			$page_header = $persona['name'] . ' by ' . $persona['display_username'];
		$category = $persona['category'];
		$persona['json'] = htmlentities(json_encode(extract_record_data($persona)));
	}

	$favorite_persona = $username ? $db->is_favorite_persona($username, $persona_id) : null;
	$nonce =  md5($persona_id . $username . PERSONAS_LOGIN_SALT);
	$url_prefix = '/gallery';
	$tabs = null;
	
	$title = $persona['name']; 
	include 'templates/header.php'; 
?>
<body>
    <div id="outer-wrapper">
        <div id="inner-wrapper">
<?php include 'templates/nav.php'; ?>
            <div id="header">
                <h2><?= $page_header ?></h2>
                <h3><?= _("Your browser, your style! Dress it up with easy-to-change \"skins\" for your Firefox.");?></h3>
            </div>
            <div id="maincontent">
                <p id="breadcrumbs"><?printf(_("<a href=\"%s\">" . _("Personas Home") . "</a> : " . _("View Personas"), $locale_conf->url('/'));?></p>
<?php if ($persona['status'] == 1)
		include 'templates/persona_detail.php';
	  else
	  	echo _("We are unable to locate the persona you requested.");
?>
			</div>
<?php include 'templates/category_nav.php'; ?>
            
        </div>
    </div>
    
<?php include 'templates/footer.php'; ?>
    <script type="text/javascript" charset="utf-8">
		

        $(document).ready(function () {
            $("#header").ie6Warning({"message":'<div id="ie6"><?= _("Upgrade your browser to get the most out of this website. <a href="%LINK%">Download Firefox for free</a>.");?></div>'});
            $("#try-button").personasButton({
                                        'hasPersonas':'<span><?= _("wear this");?></span><span>&nbsp;</span>',
                                        'hasFirefox':'<span><?= _("get personas now!");?></span><span>&nbsp;</span>',
                                        'noFirefox':'<span><?= _("get personas with firefox");?></span><span>&nbsp;</span>'
                                        });
            
            var favorite_action = <?= $favorite_persona ? 0 : 1 ?>;
            $(".favorite a").click(function() {                 
                //change to loading here
              	$(this).html(<?= _("loading...");?>);
    			$.get('/favorite/<?= $persona_id ?>/<?= $nonce ?>', {"action": favorite_action, "ajax":true}, 
    				function(data) 
    					{ 
    						favorite_action = favorite_action ? 0 : 1;
    						$(".favorite a").html(favorite_action ? <?= _("Add to favorites") . " : " . _("Remove from favorites");?>);
                            if(favorite_action) {
                                $(".favorite a").removeClass("favorited");
                            } else {
                                $(".favorite a").addClass("favorited");
                            }
    					}
    				);

    			return false;
            });                   
            
        });
    </script>
</body>
</html>
