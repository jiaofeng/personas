/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Personas.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Chris Beard <cbeard@mozilla.org>
 *   Myk Melez <myk@mozilla.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

let PersonaController = {
  _defaultHeaderBackgroundImage: null,
  _defaultFooterBackgroundImage: null,
  _defaultTitlebarColor: null,
  _previewTimeoutID: null,
  _resetTimeoutID: null,

  //**************************************************************************//
  // Convenience Getters

  // Preference Service
  get _prefSvc() {
    let prefSvc = Cc["@mozilla.org/preferences-service;1"].
                  getService(Ci.nsIPrefBranch);
    delete this._prefSvc;
    this._prefSvc = prefSvc;
    return this._prefSvc;
  },

  // Observer Service
  get _obsSvc() {
    let obsSvc = Cc["@mozilla.org/observer-service;1"].
                 getService(Ci.nsIObserverService);
    delete this._obsSvc;
    this._obsSvc = obsSvc;
    return this._obsSvc;
  },

  get _personaSvc() {
    let personaSvc = Cc["@mozilla.org/personas/persona-service;1"].
                     getService(Ci.nsIPersonaService);
    delete this._personaSvc;
    this._personaSvc = personaSvc;
    return this._personaSvc;
  },

  get _stringBundle() {
    let stringBundle = document.getElementById("personasStringBundle");
    delete this._stringBundle;
    this._stringBundle = stringBundle;
    return this._stringBundle;
  },

  get _menu() {
    let menu = document.getElementById("personas-selector-menu");
    delete this._menu;
    this._menu = menu;
    return this._menu;
  },

  get _prefCache() {
    let prefCache = new PersonasPrefCache("");
    delete this._prefCache;
    this._prefCache = prefCache;
    return this._prefCache;
  },

  _getPref: function(aPrefName, aDefaultValue) {
    return this._prefCache.getPref(aPrefName, aDefaultValue);
  },

  get _selectedPersona() {
    return this._getPref("extensions.personas.selected", "default");
  },

  get _baseURL() {
    return this._getPref("extensions.personas.url");
  },

  get _siteURL() {
    return this._getPref("extensions.personas.siteURL");
  },

  get _previewTimeout() {
    return this._getPref("extensions.personas.previewTimeout");
  },

  get _locale() {
    switch (this._getPref("general.useragent.locale", "en-US")) {
      case 'ja':
      case 'ja-JP-mac':
        return "ja";
    }
    return "en-US";
  },


  //**************************************************************************//
  // XPCOM Interface Implementations

  // nsISupports
  QueryInterface: function(aIID) {
    if (aIID.equals(Ci.nsIObserver) ||
        aIID.equals(Ci.nsIDOMEventListener) ||
        aIID.equals(Ci.nsISupports))
      return this;
    
    throw Cr.NS_ERROR_NO_INTERFACE;
  },

  // nsIObserver
  observe: function(subject, topic, data) {
    switch (topic) {
      case "personas:activePersonaUpdated":
        this._applyPersona();
        break;
      case "personas:defaultPersonaSelected":
        this._applyDefault();
        break;
      case "personas:personaLoadStarted":
        this.showThrobber(data);
        break;
      case "personas:personaLoadFinished":
        this.hideThrobber(data);
        break;
    }
  },

  // nsIDOMEventListener
  handleEvent: function(aEvent) {
    switch (aEvent.type) {
      case "SelectPersona":
        this.onSelectPersonaFromContent(aEvent);
        break;
      case "PreviewPersona":
        this.onPreviewPersonaFromContent(aEvent);
        break;
      case "ResetPersona":
        this.onResetPersonaFromContent(aEvent);
        break;
    }
  },


  //**************************************************************************//
  // Initialization & Destruction

  startUp: function() {
    // Access the persona service to initialize it.
    this._personaSvc;

    // Note: the persona service should initialize itself on startup
    // by registering with the "app-startup" XPCOM category, but for some reason
    // the persona loader iframe isn't always ready (i.e. its docShell, etc.
    // properties aren't always defined) until a browser window has been loaded.

    // Even if the service were to wait until "final-ui-startup", which happens
    // right before browser windows get opened, that's not long enough.
    // It could wait for "sessionstore-windows-restored", which would probably
    // be long enough, but that notification isn't available in Firefox 2.

    // Make sure there's a bottombox element enclosing the items below
    // the browser widget.  Firefox 3 beta 4 and later have one, but earlier
    // releases of the browser don't, and that's what we style.
    if (!document.getElementById("browser-bottombox")) {
      let bottomBox = document.createElement("vbox");
      bottomBox.setAttribute("id", "browser-bottombox");
      let previousNode =
        // #ifdef TOOLBAR_CUSTOMIZATION_SHEET
        document.getElementById("customizeToolbarSheetPopup") ||
        // Firefox 2
        document.getElementById("browser-stack") ||
        // Firefox 3
        document.getElementById("browser");
      let parentNode = document.getElementById("main-window");
      parentNode.insertBefore(bottomBox, previousNode.nextSibling);
      while (bottomBox.nextSibling)
        bottomBox.appendChild(bottomBox.nextSibling);
    }

    // Record the default header and footer background images so we can
    // revert to them if the user selects the default persona.
    let header = document.getElementById("main-window");
    this._defaultHeaderBackgroundImage = header.style.backgroundImage;
    let footer = document.getElementById("browser-bottombox");
    if (footer)
      this._defaultFooterBackgroundImage = footer.style.backgroundImage;

    // Save the titlebar color.
    this._defaultTitlebarColor = "#C9C9C9";

    // Observe various changes that we should apply to the browser window.
    this._obsSvc.addObserver(this, "personas:activePersonaUpdated", false);
    this._obsSvc.addObserver(this, "personas:defaultPersonaSelected", false);
    this._obsSvc.addObserver(this, "personas:personaLoadStarted", false);
    this._obsSvc.addObserver(this, "personas:personaLoadFinished", false);

    // Listen for various persona-related events that can bubble up from content.
    document.addEventListener("SelectPersona", this, false, true);
    document.addEventListener("PreviewPersona", this, false, true);
    document.addEventListener("ResetPersona", this, false, true);

    // Check for a first-run or updated extension and display some additional
    // information to users.
    let lastVersion = this._getPref("extensions.personas.lastversion"); 
    let thisVersion = Cc["@mozilla.org/extensions/manager;1"].
                      getService(Ci.nsIExtensionManager).
                      getItemForID(PERSONAS_EXTENSION_ID).version;
    if (lastVersion == "firstrun") {
      let firstRunURL = this._siteURL + this._locale + "/firstrun/?version=" + thisVersion;
      setTimeout(function() { window.openUILinkIn(firstRunURL, "tab") }, 500);
      this._prefSvc.setCharPref("extensions.personas.lastversion", thisVersion);
    }
    else if (lastVersion != thisVersion) {
      let updatedURL = this._siteURL + this._locale + "/updated/?version=" + thisVersion;
      setTimeout(function() { window.openUILinkIn(updatedURL, "tab") }, 500);
      this._prefSvc.setCharPref("extensions.personas.lastversion", thisVersion);
    }

    // If the persona is already available, apply it.  Otherwise we'll apply it
    // when notified that it's ready.
    if (this._personaSvc.headerURL && this._personaSvc.footerURL)
      this._applyPersona();
  },

  shutDown: function() {
    document.removeEventListener("SelectPersona", this, false);
    document.removeEventListener("PreviewPersona", this, false);
    document.removeEventListener("ResetPersona", this, false);

    this._obsSvc.removeObserver(this, "personas:activePersonaUpdated");
    this._obsSvc.removeObserver(this, "personas:defaultPersonaSelected");
    this._obsSvc.removeObserver(this, "personas:personaLoadStarted", false);
    this._obsSvc.removeObserver(this, "personas:personaLoadFinished", false);
  },


  //**************************************************************************//
  // Appearance Updates

  _applyPersona: function() {
    let personaID = this._selectedPersona;

    // FIXME: figure out where to locate this function and put it there.
    // Escape CSS special characters in unquoted URLs
    // per http://www.w3.org/TR/CSS21/syndata.html#uri
    function escapeCSSURL(aURLSpec) {
      return aURLSpec.replace(/[(),\s'"]/g, "\$&");
    }

    let os = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;

    // Style the header.
    let headerURL = this._personaSvc.headerURL;
    let header = document.getElementById("main-window");
    header.setAttribute("persona", personaID);
    header.style.backgroundImage = "url(" + escapeCSSURL(headerURL) + ")";

    // Style the titlebar with accent color.
    // Note: we only do this on Mac, since it's the only OS that supports
    // this capability.  It's only the only OS where our hack for applying
    // the change doesn't cause the window to un-maximize.
    if(this._getPref("extensions.personas.useAccentColor")) {
      if (os == "Darwin") {
        let titlebarColor = this._personaSvc.accentColor || this._defaultTitlebarColor;
        if (titlebarColor != header.getAttribute("titlebarcolor")) {
          header.setAttribute("activetitlebarcolor", titlebarColor);
          header.setAttribute("inactivetitlebarcolor", titlebarColor);
          header.setAttribute("titlebarcolor", titlebarColor);
          // FIXME: Incredibly gross hack in order to force a window redraw event
          // that ensures that the titlebar color change is applied.  Note that
          // this will unmaximize a maximized window on Windows and Linux, so we
          // only do this on Mac (which is the only place the "titlebarcolor"
          // attribute has any effect anyway at the moment).
          window.resizeTo(parseInt(window.outerWidth)+1, window.outerHeight);
          window.resizeTo(parseInt(window.outerWidth)-1, window.outerHeight);
        }
      }
    }

    // Style the footer.
    let footerURL = this._personaSvc.footerURL;
    let footer = document.getElementById("browser-bottombox");
    footer.setAttribute("persona", personaID);
    footer.style.backgroundImage = "url('" + escapeCSSURL(footerURL) + "')";

    // Style the text color.
    if(this._getPref("extensions.personas.useTextColor")) {
      let textColor = this._personaSvc.textColor;
      if (textColor) {
        for (let i = 0; i < document.styleSheets.length; i++) {
          let styleSheet = document.styleSheets[i];
          if (styleSheet.href == "chrome://personas/content/textColor.css") {
            while (styleSheet.cssRules.length > 0)
              styleSheet.deleteRule(0);

      if (os == "Darwin") {
            styleSheet.insertRule(
              "#main-window[persona] .tabbrowser-tab, " +
              "#navigator-toolbox menubar > menu, " +
              "#navigator-toolbox toolbarbutton, " +
              "#browser-bottombox, " +
              "#browser-bottombox toolbarbutton { color: " + textColor + "; font-weight: normal; }",
              0
            );
      } else {
            styleSheet.insertRule(
              "#navigator-toolbox menubar > menu, " +
              "#navigator-toolbox toolbarbutton, " +
              "#browser-bottombox, " +
              "#browser-bottombox toolbarbutton { color: " + textColor + "}",
              0
            );
      }
            // FIXME: figure out what to do about the disabled color.  Maybe we
            // should let personas specify it independently and then apply it via
            // a rule like this:
            // #navigator-toolbox toolbarbutton[disabled="true"],
            // #browser-toolbox toolbarbutton[disabled="true"],
            // #browser-bottombox toolbarbutton[disabled="true"]
            //   { color: #cccccc !important; } 

            break;
          }
        }
      }
    }
  },

  _applyDefault: function() {

    let header = document.getElementById("main-window");
    header.removeAttribute("persona");
    header.style.backgroundImage = this._defaultHeaderBackgroundImage;

    // Reset the titlebar to the default color.
    // Note: we only do this on Mac, since it's the only OS that supports
    // this capability.  It's also the only OS where our hack for applying
    // the change doesn't cause the window to un-maximize.
    let os = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;
    if (os == "Darwin") {
      if (header.getAttribute("titlebarcolor") != this._defaultTitlebarColor) {
        header.setAttribute("activetitlebarcolor", this._defaultTitlebarColor);
        header.setAttribute("inactivetitlebarcolor", this._defaultTitlebarColor);
        header.setAttribute("titlebarcolor", this._defaultTitlebarColor);
        // FIXME: Incredibly gross hack in order to force a window redraw event
        // that ensures that the titlebar color change is applied.  Note that
        // this will unmaximize a maximized window on Windows and Linux, so we
        // only do this on Mac (which is the only place the "titlebarcolor"
        // attribute has any effect anyway at the moment).
        window.resizeTo(parseInt(window.outerWidth)+1, window.outerHeight);
        window.resizeTo(parseInt(window.outerWidth)-1, window.outerHeight);
      }
    }

    let footer = document.getElementById("browser-bottombox");
    footer.removeAttribute("persona");
    footer.style.backgroundImage = this._defaultFooterBackgroundImage;

    // Remove the text color rule.
    for (let i = 0; i < document.styleSheets.length; i++) {
      let styleSheet = document.styleSheets[i];
      if (styleSheet.href == "chrome://personas/content/textColor.css") {
        while (styleSheet.cssRules.length > 0)
          styleSheet.deleteRule(0);
        break;
      }
    }
  },


  //**************************************************************************//
  // Persona Selection, Preview, and Reset

  /**
   * Select a persona from content via a SelectPersona event.  Checks to ensure
   * the page is hosted on a server authorized to select personas and the persona
   * is in the list of personas known to the persona service.  Retrieves the ID
   * of the persona from the "persona" attribute on the target of the event.
   *
   * @param aEvent {Event} the SelectPersona DOM event
   */
  onSelectPersonaFromContent: function(aEvent) {
    this._authorizeHost(aEvent);

    if (!aEvent.target.hasAttribute("persona"))
      throw "node does not have 'persona' attribute";

    let personaID = aEvent.target.getAttribute("persona");

    if (!this._getPersona(personaID))
      throw "unknown persona " + personaID;

    // Optional; the node might not identify the category to which the persona
    // belongs.  It only matters when the user selects "random persona from this
    // category" (which at the moment the personas directory doesn't expose).
    let categoryName = aEvent.target.getAttribute("category");

    this._selectPersona(personaID, categoryName);
  },

  onSelectPersona: function(aEvent) {
    let personaID = aEvent.target.getAttribute("personaid");
    let categoryName = aEvent.target.getAttribute("categoryname");
    this._selectPersona(personaID, categoryName);
  },

  /**
   * Select the persona with the specified ID.
   *
   * @param personaID     {integer} the ID of the persona to select
   * @param categoryName  {string}
   *        (optional) the name of the category to which the persona belongs;
   *        this only matters when the user selects "random persona from this
   *        category"
   */
  _selectPersona: function(personaID, categoryName) {
    // Update the list of recent personas.
    if (personaID != "default" && personaID != this._selectedPersona && this._selectedPersona != "random") {
      this._prefSvc.setCharPref("extensions.personas.lastselected3",
                                this._getPref("extensions.personas.lastselected2"));
      this._prefSvc.setCharPref("extensions.personas.lastselected2",
                                this._getPref("extensions.personas.lastselected1"));
      this._prefSvc.setCharPref("extensions.personas.lastselected1",
                                this._getPref("extensions.personas.lastselected0"));
      this._prefSvc.setCharPref("extensions.personas.lastselected0", this._selectedPersona);
    }

    // Save the new selection to prefs.
    // We save the category first, since the moment we set personaID to "random",
    // the persona service will select a random persona from the current category.
    // FIXME: implement batch setting of preferences to fix this problem.
    if (categoryName)
      this._prefSvc.setCharPref("extensions.personas.category", categoryName);
    this._prefSvc.setCharPref("extensions.personas.selected", personaID);
  },

  /**
   * Preview the persona specified by a web page via a PreviewPersona event.
   * Checks to ensure the page is hosted on a server authorized to set personas
   * and the persona is in the list of personas known to the persona service.
   * Retrieves the ID of the persona from the "persona" attribute on the target
   * of the event.
   * 
   * @param aEvent {Event} the PreviewPersona DOM event
   */
  onPreviewPersonaFromContent: function(aEvent) {
    this._authorizeHost(aEvent);

    if (!aEvent.target.hasAttribute("persona"))
      throw "node does not have 'persona' attribute";

    let personaID = aEvent.target.getAttribute("persona");

    if (!this._getPersona(personaID))
      throw "unknown persona " + personaID;

    this._previewPersona(personaID);
  },

  onPreviewPersona: function(aEvent) {
    //this._previewPersona(aEvent.target.getAttribute("personaid"));

    if(this._getPref("extensions.personas.previewEnabled")) {

       if (this._resetTimeoutID) {
         window.clearTimeout(this._resetTimeoutID);
         this._resetTimeoutID = null;
       }

       let t = this;
       let personaID = aEvent.target.getAttribute("personaid");
       let callback = function() { t._previewPersona(personaID) };
       this._previewTimeoutID = window.setTimeout(callback, this._previewTimeout);
    }
  },

  _previewPersona: function(aPersonaID) {
    this._personaSvc.previewPersona(aPersonaID);
  },

  /**
   * Reset the displayed persona to the selected persona via a ResetPersona event.
   * Checks to ensure the page is hosted on a server authorized to modify personas
   * and the persona is in the list of personas known to the persona service.
   * Retrieves the ID of the persona from the "persona" attribute on the target
   * of the event.
   * 
   * @param aEvent {Event} the ResetPersona DOM event
   */
  onResetPersonaFromContent: function(aEvent) {
    this._authorizeHost(aEvent);
    this._resetPersona();
  },

  onResetPersona: function(aEvent) {
    //this._resetPersona();

    if(this._getPref("extensions.personas.previewEnabled")) {

       if (this._previewTimeoutID) {
         window.clearTimeout(this._previewTimeoutID);
         this._previewTimeoutID = null;
       }

       let t = this;
       let personaID = aEvent.target.getAttribute("personaid");
       let callback = function() { t._resetPersona(personaID) };
       this._resetTimeoutID = window.setTimeout(callback, this._previewTimeout);
    }
  },

  _resetPersona: function() {
    this._personaSvc.resetPersona();
  },

  onSelectDefault: function() {
    this._selectPersona("default", "");
  },

  onSelectPreferences: function() {
    window.openDialog('chrome://personas/content/preferences.xul', '', 
		'chrome,titlebar,toolbar,centerscreen');
  },

  onViewDirectory: function() {
    window.openUILinkIn(this._siteURL, "tab");
  },

  onSelectCustom: function() {
    window.openUILinkIn("chrome://personas/content/customPersonaEditor.xul", "tab");
  },

  onSelectAbout: function(event) {
    window.openUILinkIn(this._siteURL + this._locale + "/about/?persona=" + this._selectedPersona, "tab");
  },

  /**
   * Ensure the host that loaded the document from which the given DOM event
   * came matches an entry in the personas whitelist.  The host matches if it
   * ends with one of the entries in the whitelist.  For example, if
   * .mozilla.com is an entry in the whitelist, then www.mozilla.com matches,
   * as does labs.mozilla.com, but mozilla.com does not, nor does evil.com.
   * 
   * @param aEvent {Event} the DOM event
   */
  _authorizeHost: function(aEvent) {
    let host = aEvent.target.ownerDocument.location.hostname;
    let hostBackwards = host.split('').reverse().join('');
    let authorizedHosts = this._getPref("extensions.personas.authorizedHosts").split(/[, ]+/);
    if (!authorizedHosts.some(function(v) { return hostBackwards.indexOf(v.split('').reverse().join('')) == 0 }))
      throw host + " not authorized to modify personas";
  },

  _getPersona: function(aPersonaID) {
    for each (let persona in this._personaSvc.personas.wrappedJSObject)
      if (persona.id == aPersonaID)
        return persona;

    return null;
  },

  showThrobber: function(aPersonaID) {
    document.getElementById("personas-selector-button").setAttribute("busy", "true");
    let items = this._menu.getElementsByAttribute("personaid", aPersonaID);
    for (let i = 0; i < items.length; i++)
      items[i].setAttribute("busy", "true");
  },

  hideThrobber: function(aPersonaID) {
    document.getElementById("personas-selector-button").removeAttribute("busy");
    let items = this._menu.getElementsByAttribute("personaid", aPersonaID);
    for (let i = 0; i < items.length; i++)
      items[i].removeAttribute("busy");
  },

  //**************************************************************************//
  // Popup Construction

  onMenuButtonMouseDown: function(event) {
    var menuPopup = document.getElementById('personas-selector-menu');
    var menuButton = document.getElementById("personas-selector-button");
      
    // If the menu popup isn't on the menu button, then move the popup onto
    // the button so the popup appears when the user clicks the button.  We'll
    // move the popup back to the Tools > Sync menu when the popup hides.
    if (menuPopup.parentNode != menuButton)
      menuButton.appendChild(menuPopup);
  },

  onMenuPopupHiding: function() {
    var menuPopup = document.getElementById('personas-selector-menu');
    var menu = document.getElementById('personas-menu');

    // If the menu popup isn't on the Tools > Personas menu, then move the popup
    // back onto that menu so the popup appears when the user selects the menu.
    // We'll move the popup back to the menu button when the user clicks on
    // the menu button.
    if (menuPopup.parentNode != menu)
      menu.appendChild(menuPopup);    
  },

  onPersonaPopupShowing: function(event) {
    if (event.target != this._menu)
      return false;

    // FIXME: make sure we have this data and display something meaningful
    // if we don't have it yet.
    if(!this._personaSvc.categories || !this._personaSvc.personas) {
        alert("Personas Data not available yet. Please check your network connection and restart Firefox, or try again in a few minutes.");
	return false;
    }
    let categories = this._personaSvc.categories.wrappedJSObject;
    let personas = this._personaSvc.personas.wrappedJSObject;

    this._rebuildMenu(categories, personas);

    let customMenu = this._getPref("extensions.personas.showCustomMenu");
    if (customMenu) {
      let customMenu = document.getElementById("custom-menu");
      customMenu.setAttribute("label", this._getPref("extensions.personas.custom.customName"));
      customMenu.setAttribute("hidden", "false");
    } else {
      document.getElementById("custom-menu").setAttribute("hidden", "true");
    }

    return true;
  },

  _rebuildMenu: function(categories, personas) {
    let openingSeparator = document.getElementById("personasOpeningSeparator");
    let closingSeparator = document.getElementById("personasClosingSeparator");

    // Remove everything between the two separators.
    while (openingSeparator.nextSibling && openingSeparator.nextSibling != closingSeparator)
      this._menu.removeChild(openingSeparator.nextSibling);

    let personaStatus = document.getElementById("persona-current");
    if (this._selectedPersona == "random") {
       personaStatus.setAttribute("class", "menuitem-iconic");
       personaStatus.setAttribute("image", "chrome://personas/content/random-feed-16x16.png");
       // FIXME: make this a formatted string using %S in the properties file.
       personaStatus.setAttribute("label", this._stringBundle.getString("useRandomPersona.label") + " " +
                                           this._getPref("extensions.personas.category") + " > " +
                                           this._getPersonaName(this._getPref("extensions.personas.lastrandom")));
    }
    else {
       personaStatus.removeAttribute("class");
       personaStatus.removeAttribute("image");
       personaStatus.setAttribute("label", this._getPersonaName(this._selectedPersona));
    }

    // FIXME: factor out all the common code below.

    // Create the "Most Popular" menu.
    {
      let menu = document.createElement("menu");
      menu.setAttribute("label", this._stringBundle.getString("popular.label"));
      let popupmenu = document.createElement("menupopup");
  
      for each (let persona in this._personaSvc.popular.wrappedJSObject)
        popupmenu.appendChild(this._createPersonaItem(persona, null));

      menu.appendChild(popupmenu);
      this._menu.insertBefore(menu, closingSeparator);
    }

    // Create the "New" menu.
    {
      let menu = document.createElement("menu");
      menu.setAttribute("label", this._stringBundle.getString("new.label"));
      let popupmenu = document.createElement("menupopup");
  
      for each (let persona in this._personaSvc.recent.wrappedJSObject)
        popupmenu.appendChild(this._createPersonaItem(persona, null));
  
      menu.appendChild(popupmenu);
      this._menu.insertBefore(menu, closingSeparator);
    }

    // Create the "Recently Selected" menu.
    {
      let menu = document.createElement("menu");
      menu.setAttribute("label", this._stringBundle.getString("recent.label"));
      let popupmenu = document.createElement("menupopup");

      for (let i = 0; i < 4; i++) {
        let recentID = this._getPref("extensions.personas.lastselected" + i);
        if (!recentID)
          continue;

        let persona = this._getPersona(recentID);
        if (persona)
          popupmenu.appendChild(this._createPersonaItem(persona, ""));
      }

      menu.appendChild(popupmenu);
      this._menu.insertBefore(menu, closingSeparator);
    }

    // Create the "Categories" menu hierarchy.
    let categoriesMenu = document.createElement("menu");
    categoriesMenu.setAttribute("label", this._stringBundle.getString("categories.label"));
    let categoriesPopup = document.createElement("menupopup");
    categoriesMenu.appendChild(categoriesPopup);
    this._menu.insertBefore(categoriesMenu, closingSeparator);
    for (let categoryName in categories) {
      let category = categories[categoryName];
      let menu = document.createElement("menu");
      menu.setAttribute("label", categoryName);
      let popupmenu = document.createElement("menupopup");

      let recentIDs = [persona.id for each (persona in category.recent)];
      for each (let persona in category.popular) {
        let menuItem = this._createPersonaItem(persona, category.id);
        if (recentIDs.indexOf(persona.id) != -1)
          menuItem.setAttribute("recent", "true");
        popupmenu.appendChild(menuItem);
      }

      // Create an item that picks a random persona from the category.
      popupmenu.appendChild(document.createElement("menuseparator"));
      popupmenu.appendChild(this._createRandomItem(categoryName));

      menu.appendChild(popupmenu);
      categoriesPopup.appendChild(menu);
    }
  },

  _getPersonaName: function(personaID) {
    let personas = this._personaSvc.personas.wrappedJSObject;
    let defaultString = this._stringBundle.getString("Default");

    if (personaID == "default")
      return defaultString;

    for each (let persona in personas)
      if (persona.id == personaID)
        return persona.name;

    return defaultString;
  },

  _createSubcategoryHeader: function(subcategory) {
    let header = document.createElement("menuitem");

    header.setAttribute("header", "true");
    header.setAttribute("disabled", true);
    header.setAttribute("label", this._stringBundle.getString(subcategory + ".label"));

    return header;
  },

  _createPersonaItem: function(persona, categoryName) {
    let item = document.createElement("menuitem");

    // We store the ID of the persona in the "personaid" attribute instead of
    // the "id" attribute because "id" has to be unique, and personas sometimes
    // are associated with multiple menuitems (f.e. when they are both popular
    // and recent).
    item.setAttribute("class", "menuitem-iconic");
    item.setAttribute("personaid", persona.id);
    item.setAttribute("label", persona.name);
    item.setAttribute("type", "checkbox");
    item.setAttribute("checked", (persona.id == this._selectedPersona));
    item.setAttribute("autocheck", "false");
    item.setAttribute("categoryname", categoryName);
    item.setAttribute("oncommand", "PersonaController.onSelectPersona(event)");
    item.addEventListener("DOMMenuItemActive", function(evt) { PersonaController.onPreviewPersona(evt) }, false);
    item.addEventListener("DOMMenuItemInactive", function(evt) { PersonaController.onResetPersona(evt) }, false);
    
    return item;
  },

  _createRandomItem: function(categoryName) {
    let item = document.createElement("menuitem");

    item.setAttribute("personaid", "random");
    item.setAttribute("categoryname", categoryName);
    item.setAttribute("class", "menuitem-iconic");
    item.setAttribute("image", "chrome://personas/content/random-feed-16x16.png");
    // FIXME: insert categoryName into the localized string via getFormattedString.
    item.setAttribute("label", this._stringBundle.getString("useRandomPersona.label") + " " + categoryName);
    item.setAttribute("oncommand", "PersonaController.onSelectPersona(event);");

    return item;
  }

};

window.addEventListener("load", function(e) { PersonaController.startUp(e) }, false);
window.addEventListener("unload", function(e) { PersonaController.shutDown(e) }, false);