<?php 

    header('Cache-Control: no-store, must-revalidate, post-check=0, pre-check=0, private, max-age=0');
	header('Pragma: private');
    
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
            "http://www.w3.org/TR/html4/strict.dtd">
<?//TODO lang="en"? ?>
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title><?printf(_("Personas for Firefox | %s"), ($title ? $title : ""));?></title>
	<link href="/static/css/style.css" rel="stylesheet" type="text/css" media="all" />
    <script src="/static/js/jquery.js"></script>
    <script src="/static/js/script.js"></script>
    <link rel="shortcut icon" href="/static/img/favicon.ico" type="image/x-icon" />
    
</head>
