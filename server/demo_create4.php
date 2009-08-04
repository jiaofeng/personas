<?php
	require_once 'lib/personas_constants.php';
	require_once 'lib/user.php';	
	require_once "lib/language.php";


	$user = new PersonaUser();
	$title = _("How to Create Personas"); 
	include 'templates/header.php'; 
?>
<body>
    <div id="outer-wrapper">
        <div id="inner-wrapper">
<?php include 'templates/nav.php'; ?>
            <div id="header">
                <h2><?= _("How To");?></h2>
                <h3><?= _("Personas are lightweight, easy to install and easy to change \"skins\" for your Firefox web browser.");?></h3>
            </div>
            <div id="maincontent" class="demo">
                <div id="breadcrumbs">
                    <?printf("<a href=\"%s\">" . _("Personas Home") . "</a> : " . _("How to Create Personas"), $locale_conf->url('/'));?>
                </div>
                
                	<div id="tutorial">

                		<div class="tut_Header"><?= _("How to Create Personas");?></div>

                		<div class="tut_Copy">

                		<p><?= _("Personas are made up of two graphic image files - a \"header\" image and a \"footer\" image - which skin
                			the default Firefox UI background.");?>

                		</div>

                		<table class="tut_nav">
                			<tr>
                				<td class="tut_left"><?printf("<a href=\"%s\">" . _("Step 1: Creating a Persona Header Image") . "</a> &raquo;", $locale_conf->url('/demo_create'));?></td>
                				<td class="tut_left"><?printf("<a href=\"%s\">" . _("Step 3: Testing your Persona Images") . "</a> &raquo;", $locale_conf->url('/demo_create_3'));?></td>
                			</tr>
                			<tr>
                				<td class="tut_left"><?printf("<a href=\"%s\">" . _("Step 2: Creating a Persona Footer Image") . "</a> &raquo;", $locale_conf->url('/demo_create_2'));?></td>
                				<td class="tut_leftOFF"><?= _("Step 4: Submit your Persona!");?></td>
                			</tr>
                		</table>

                	<!-- STEP 4 -->

                		<div class="tut_Box">

                		<div class="tut_step"><span class="tut_Title">Step 4: Submit your Persona!</span></div>

                		<div class="tut_Copy">

                		<p><?= _("Now that you have finalized the artwork, it is time to share! One thing to note, please do be sure
                		that you have the rights to use whatever image or design you use in your Persona. (We don't want to
                		get any nasty lawyer letters!");?>)

                		<p><?= _("Follow the link below to start the process and add your creations to the constantly growing
                		catalog of Firefox Personas!");?></div>

                		<div class="link"><?printf(_("Go submit your first Persona:") . "  <a href=\"%s\">
                        <img class=\"button\" src=\"/static/img/tut_btn_getStarted.gif\" border=\"0\"></a>", $locale_conf->url('/upload'));?></div>

                		<table class="tut_nav">
                				<tr>
                					<td>
                						<div class="tut_left"><?printf("<b>&laquo; <a href=\"%s\">" . _("Back to Step 3") . "</a></b>", $locale_conf->url('/demo_create_3'));?></div>
                					</td>
                					<td></td>
                				</tr>
                		</table>

                		</div>

                		<br><br>


                <!-- RESOURCES -->
                		<div class="tut_didyouknow"><img src="/static/img/question-64.png" class="tut_icon"><p><?printf (_("Did you know you can test a Persona before you submit it?  <b><a href=\"%s\">Find out how!</a>&raquo;</b>"), $locale_conf->url('/demo_create_3#test'));?></div>

                		<div class="tut_info"><img src="/static/img/information-64.png" class="tut_icon">

                		<p><span class="tut_TitleInfo"><?= _("Online Image Editor Resources");?></span><br><br>

                		<ul>

                		<li><a href="http://www.sumopaint.com">SUMOPaint</a> - <?= _("SUMO Paint offers professional and easy to use tools for creating and editing images within a browser. SUMO Paint is a free image editing software that gives you the opportunity to create, edit and comment images online with powerful tools and layer support.");?> </li>
                		<li><a href="http://www.photoshop.com">Photoshop.com</a> - <?= _("Tweak, rotate and touch up photoswith Photoshop&reg; Express, your free online photo editor.");?></li>
                		<li><a href="http://aviary.com/home">Aviary Phoenix</a> - <?= _("All the Photoshop features you actually need, at a fraction of the price. Did we mention built-in collaboration? Create and edit with the world!");?></li>

                		</ul>

                		</div>		</div>

                
                
         
         
            </div>


<?php include 'templates/get_personas.php'; ?>
        </div>
    </div>
<?php include 'templates/footer.php'; ?>
</body>
</html>
