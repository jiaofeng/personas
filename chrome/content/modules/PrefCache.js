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
 * The Original Code is PrefCache.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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

EXPORTED_SYMBOLS = ["PersonasPrefCache"];

// We don't use Cc, Ci, and Cr in this module because we can't simultaneously
// declare them when this is imported as a module in Firefox 3 and not declare
// them when this is loaded as a subscript in Firefox 2.

// FIXME: we name this PersonasPrefCache to make sure we don't stomp on any
// other object named PrefCache in Firefox 2, but once we stop supporting that
// version we should rename this to simply PrefCache.
function PersonasPrefCache(aPrefBranch, aObserver) {
  // FIXME: return an existing cache for this pref branch, if any,
  // instead of creating a new one from scratch (i.e. cache the caches).

  this._prefBranch = aPrefBranch;
  this._prefs = {};
  this._observers = [];

  if (aObserver)
    this.addObserver(aObserver);

  this._prefSvc.addObserver(this._prefBranch, this, false);
  this._obsSvc.addObserver(this, "profile-after-change", false);
  this._obsSvc.addObserver(this, "quit-application", false);
}

PersonasPrefCache.prototype = {
  _prefBranch: null,
  _prefs: null,
  _observers: null,

  // Preference Service
  get _prefSvc() {
    // Enable both the nsIPrefBranch and the nsIPrefBranch2 interfaces
    // so we can both retrieve preferences and add observers.
    let prefSvc = Components.classes["@mozilla.org/preferences-service;1"].
                  getService(Components.interfaces.nsIPrefBranch).
                  QueryInterface(Components.interfaces.nsIPrefBranch2);
    this.__defineGetter__("_prefSvc", function() { return prefSvc });
    return this._prefSvc;
  },

  // Observer Service
  get _obsSvc() {
    let obsSvc = Components.classes["@mozilla.org/observer-service;1"].
                 getService(Components.interfaces.nsIObserverService);
    this.__defineGetter__("_obsSvc", function() { return obsSvc });
    return this._obsSvc;
  },

  /**
   * Get the value of a pref, if any; otherwise return the default value.
   *
   * @param   aPrefName      the name of the pref to get
   * @param   aDefaultValue  the default value, if any
   *
   * @returns the value of the pref, if any; otherwise the default value
   */
  getPref: function(aPrefName, aDefaultValue) {
    if (!this._prefs[aPrefName]) {
      try {
        switch (this._prefSvc.getPrefType(aPrefName)) {
          case Components.interfaces.nsIPrefBranch.PREF_STRING:
            this._prefs[aPrefName] = this._prefSvc.getCharPref(aPrefName);
            break;
          case Components.interfaces.nsIPrefBranch.PREF_INT:
            this._prefs[aPrefName] = this._prefSvc.getIntPref(aPrefName);
            break;
          case Components.interfaces.nsIPrefBranch.PREF_BOOL:
            this._prefs[aPrefName] = this._prefSvc.getBoolPref(aPrefName);
            break;
          default:
            return aDefaultValue;
        }
      }
      catch (ex) {
        return aDefaultValue;
      }
    }

    return this._prefs[aPrefName];
  },

  addObserver: function(aObserver) {
    if (this._observers.indexOf(aObserver) == -1)
      this._observers.push(aObserver);
  },
  
  removeObserver: function(aObserver) {
    if (this._observers.indexOf(aObserver) != -1)
      this._observers.splice(this._observers.indexOf(aObserver), 1);
  },

  _notifyObservers: function(aSubject, aTopic, aData) {
    for (let i = 0; i < this._observers.length; i++)
      this._observers[i].observe(aSubject, aTopic, aData);
  },

  // nsISupports

  QueryInterface: function(aIID) {
    if (aIID.equals(Components.interfaces.nsIObserver) ||
        aIID.equals(Components.interfaces.nsISupports))
      return this;
    
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  // nsIObserver

  observe: function(aSubject, aTopic, aData) {
    switch (aTopic) {
      case "nsPref:changed":
        delete this._prefs[aData];
        this._notifyObservers(aSubject, aTopic, aData);
        break;

      case "profile-after-change":
        this._prefs = {};
        break;

      case "quit-application":
        this._obsSvc.removeObserver(this, "profile-after-change");
        this._obsSvc.removeObserver(this, "quit-application");
        this._prefSvc.removeObserver(this._prefBranch, this);
        this._observers = null;
        break;
    }
  }

};
