<?php
	require_once 'lib/personas_constants.php';
	require_once 'lib/user.php';
	require_once 'lib/storage.php';

	$user = new PersonaUser();
	$db = new PersonaStorage();

    $pending = $db->get_pending_persona_count();
	$total = $db->get_active_persona_count();

	$title = "Personas Dashboard"; 
	include 'templates/header.php'; 
?>
<body>
    <div id="outer-wrapper">
        <div id="inner-wrapper">
<?php include 'templates/nav.php'; ?>
            <div id="header">
                <h2>Frequent Questions</h2>
                <h3>Personas are lightweight, easy to install and easy to change “skins” for your Firefox web browser.</h3>
            </div>
            <div id="maincontent" class="demo">
                <div id="breadcrumbs">
                    <a href="http://www.getpersonas.com">Personas Home</a> :  Dashboard
                </div>
               
                <p>
                    <strong>Total Public Personas:</strong> <?php echo $total ?>
                </p>
                
                <p>
                    <strong>Total Personas In Queue:</strong> <?php echo $pending ?>
                </p>
            </div>
<?php include 'templates/get_personas.php'; ?>
        </div>
    </div>
<?php include 'templates/footer.php'; ?>
</body>
</html>
