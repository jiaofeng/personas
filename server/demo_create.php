<?php
	require_once 'lib/personas_constants.php';
	require_once 'lib/user.php';	


	$user = new PersonaUser();
	$title = "How to Create Personas"; 
	include 'templates/header.php'; 
?>
<body>
    <div id="outer-wrapper">
        <div id="inner-wrapper">
<?php include 'templates/nav.php'; ?>
            <div id="header">
                <h2>Demo</h2>
                <h3>Personas are lightweight, easy to install and easy to change “skins” for your Firefox web browser.</h3>
            </div>
            <div id="maincontent" class="demo">
                <div id="breadcrumbs">
                    <a href="http://www.getpersonas.com">Personas Home</a> : How to Create Personas
                </div>
                <h3>How to Create Personas</h3>
                

                
                
                <div id="tutorial">


                	<!-- STEP 1 -->


                		<div class="tut_Title">Step 1: Understanding and Designing Persona Header and Footer Images</div>

                        <p>


                		Personas are made up of two graphic image files - a "header" image and a "footer" image - which skin
                		the default Firefox UI background.</p>

                		<div class="tut_SubTitle">An example of a header image</div>

                	    <p>

                		The header image is displayed as the background of the top of the browser window, nestling in behind
                		the toolbars, address bar, search bar and the tab strip.</p>

                		<p><span class="tutBold">Whatever header image you create, it will be anchored to the top-right corner of the
                		browser window</span>.  The right-hand side of the image is always visible, and as a user
                		increases the width of the browser window, the browser reveals more of the left-hand side of the
                		image. This means that the most valuable visual information should be placed in the upper right area
                		of the header image.</p>

                		<p>The browser might reveal more of the lower portion of the image as well if it (or an extension)
                		adds another toolbar (like the toolbar that comes with the StumbleUpon extension) or other UI
                		elements to the top of the window.</p>

                		<p>The header image should be PNG or JPG, <span class="tutBold">3000 pixels wide and 200 pixels tall</span> and <span class="tutBold">no
                		larger than 300kb in filesize.</span></p>


                		<div class="tut_Image"><a href="/static/img/Persona_Header_LABS.jpg"><img src="/static/img/tut_headerImage.jpg"
                		border="0"></a></div>

                		<div class="tut_SubTitle">Header image as seen in OSX, XP and Vista</div>

                		<div class="tut_Image"><img src="/static/img/tut_OSXheader.jpg" border="0"><span
                		class="caption">OSX</span></div> <div class="tut_Image"><img src="/static/img/tut_XPheader.jpg"
                		border="0"><span class="caption">Windows XP</span></div> <div class="tut_Image"><img
                		src="/static/img/tut_VISTAheader.jpg" border="0"><span class="caption">Windows Vista</span></div>

                		<div class="tut_SubTitle">An example of a footer image</div>

                        <p>


                		The footer image is displayed as the background of the bottom of the browser window, behind the
                		status and find bars.</p>

                		<p><span class="tutBold">The footer image, unlike the header, is anchored to the bottom-left corner of the browser
                		window</span>, so the left-hand side of the image is always visible. As a user increases the width
                		of the browser window, the browser reveals more of the right-hand side of the image.</p>

                		<p>When the status bar is in its default state, there is very little of the footer image shown
                		vertically, and this should be taken into account in your designs.  The browser might reveal more of
                		the upper portion of the image as well if it (or an extension) adds another bar (like the Find bar)
                		or other UI elements to the bottom of the window.</p>

                		<p>The footer image should be PNG or JPG, <span class="tutBold">3000 pixels wide and 100 pixels tall</span> and <span class="tutBold">no
                		larger than 300kb in filesize.</span></p>

                		<div class="tut_Image"><a href="/static/img/Persona_Footer_LABS.jpg"><img src="/static/img/tut_footerImage.jpg"
                		border="0"></a></div>

                		<div class="tut_SubTitle">Footer image as seen in OSX, XP and Vista</div>

                		<div class="tut_Image"><img src="/static/img/tut_OSXfooter.jpg" border="0"><span
                		class="caption">OSX</span></div> <div class="tut_Image"><img src="/static/img/tut_XPfooter.jpg"
                		border="0"><span class="caption">Windows XP</span></div> <div class="tut_Image"><img
                		src="/static/img/tut_VISTAfooter.jpg" border="0"><span class="caption">Windows Vista</span></div>



                	<!-- STEP 2 -->


                		<div class="tut_Title">Step 2: Testing your Persona Header and Footer Images</div>

                	    <p>

                		In general, designs that feature rich content areas in the top-right corner of the browser work
                		best. Though that may be true, you should always check to see where the UI elements sit on top of
                		your designs within the different platform versions of Firefox. <p>This may be a critical step in
                		finalizing your image, depending on the importance of the visual information you are including in
                		your designs.</p>



                		<div class="tut_SubTitle">Option 1: Using the Custom Persona setting within Firefox</div> 

                		<p>


                		Within the Personas menu in the bottom left of the browser's status bar, you can enable an "offline" Persona on your own personal computer by enabling a setting within Preferences.
                		In doing this, you can test your Personas before submitting them to the online catalog.  Follow these four steps to get the Custom Personas option up and running in your browser:

            		</p>

                		<div class="tut_Image"><img src="/static/img/tut_custom_1.jpg" border="0"><br><span
                		class="caption"><span class="tutBold">STEP 1)</span> select "Preferences..."  <span class="tutBold">STEP 2)</span> check "Show Custom Persona in menu" <span class="tutBold">STEP 3)</span> select the Custom Persona and "Edit"</span></div>

                		<div class="tut_Image"><img src="/static/img/tut_custom_2.jpg" border="0"><br><span
                		class="caption"><span class="tutBold">STEP 4)</span> Build the Persona using the upload fields and additional settings</span></div>


                		<p>

                		Once your images are playing nice with the UI for all the OS flavors of Firefox, save final copies (PNG or JPG) -
                		but be sure to check to <span class="tutBold">ensure they don't exceed 300k in filesize!</span>. (Note: This will only test your Persona on the platform you are currently using)

            		</p>

                		

                		<div class="tut_SubTitle">Option 2: Cross-Platform Photoshop PSD Header Template</div> 

                        <p>

                		We've created a positioning template that can be used to help figure out placement of your
                		artwork. The template is structured to allow testing of your Persona header within OSX, Windows XP and Windows Vista
                		flavors of the browser. </p>

                		<div class="link">Download the Personas Header Template:  <a
                		href="/static/img/Persona_Header_TEMPLATE.psd" class="button"><span>download</span><span>&nbsp;</span></a></div>


                        <p>
                		The key to using this PSD template is to simply layer your Persona header image underneath one of
                		the three OS layers.  Be sure to turn off any of the OS layers you aren't using, as they will
                		overlap each other due to their transparency.</p>

                		<div class="tut_Image center"><img src="/static/img/tut_PSpalette.jpg" border="0"><br><span
                		class="caption">Photoshop overlay layerset</span></div>

                	

                		<p>Once you turn on an OS layer, you will be able to see where the UI elements will sit on top of
                		your designs and you can flag any conflicts that may arise. </p>

                		<div class="tut_SubTitle">Layer Overlays in Header Template PSD</div>

                		<div class="tut_Image"><img src="/static/img/tut_OSXmask.jpg" border="0"><span class="caption">OSX layer
                		overlay</span></div> <div class="tut_Image"><img src="/static/img/tut_XPmask.jpg" border="0"><span
                		class="caption">Windows XP layer overlay</span></div> <div class="tut_Image"><img
                		src="/static/img/tut_VISTAmask.jpg" border="0"><span class="caption">Windows Vista layer
                		overlay</span></div>


                	    <p>

                		The example below shows our tutorial header image layered underneath the XP overlay, highlighting
                		where the UI will interact with the design and warning of any issues that you may want to address.
                		The secondary dark bar below the toolbar images is the location of the tabstrip.</p>

                		<div class="tut_Image"><img src="/static/img/tut_XPoverlay.jpg" border="0"><span class="caption">XP
                		overlay on top of header image</span></div>

                		<p>
                		Once your images are playing nice with the UI for all the OS flavors of Firefox, save final copies (PNG or JPG) -
                		but be sure to check to <span class="tutBold">ensure they don't exceed 300k in filesize!</span>.</p>



                	<!-- STEP 3 -->



                		<div class="tut_Title">Step 3: Submit your Persona!</div>

                        <p>

                		Now that you have finalized the artwork, it is time to share! One thing to note, please do be sure
                		that you have the rights to use whatever image or design you use in your Persona. (We don't want to
                		get any nasty lawyer letters!)</p>

                		<p>Follow the link below to start the process and add your creations to the constantly growing
                		catalog of Firefox Personas!</p>

                		<div class="link">Go create your first Persona:  <a href="/upload" class="button"><span>get started!</span><span>&nbsp;</span></a></div>




                	</div>
                
                
         
         
            </div>
<?php include 'templates/get_personas.php'; ?>
        </div>
    </div>
<?php include 'templates/footer.php'; ?>
</body>
</html>