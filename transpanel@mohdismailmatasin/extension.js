/*
* Transparent panels reloaded - Cinnamon desktop extension
* Make your panels transparent (or not) and change their color as you wish
* Copyright (C) 2025 Mohd Ismail Mat Asin
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const UUID = "transpanel@mohdismailmatasin";

const Gettext = imports.gettext;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const MessageTray = imports.ui.messageTray;
const Panel = imports.ui.panel;
const Settings = imports.ui.settings;
const St = imports.gi.St;
const Util = imports.misc.util;

let Policies;
if (typeof require !== 'undefined') {
    Policies = require('./policies');
} else {
    const Self = imports.ui.extensionSystem.extensions[UUID];
    Policies = Self.policies;
}

const ANIMATIONS_DURATION = 200;
const DEFAULT_PANEL_COLOR = {
    red: 0,
    green: 0,
    blue: 0
}
const DEFAULT_THEME = "panel-transparent";
const TRANSPARENT_THEME = "panel-transparent__internal";


function _(str) {
    let customTranslation = Gettext.dgettext(UUID, str);
    if (customTranslation !== str) {
        return customTranslation;
    }
    return Gettext.gettext(str);
}

function MyExtension(meta) {
    this._init(meta);
}

MyExtension.prototype = {
    _init: function (meta) {
        this.meta = meta;
        this._signals = null;
        this._panel_status = new Array(Main.panelManager.panelCount);
        for (let i = 0; i < this._panel_status.length; i++)
            this._panel_status[i] = false;

        this.policy = new Policies.MaximizedPolicy(this);
        this.settings = new Settings.ExtensionSettings(this, meta.uuid);
        this.alwaysTransparent = this.settings.getValue("always-transparent");
        this.on_settings_changed = this.on_settings_changed.bind(this);
        this.settings.bind("always-transparent", "alwaysTransparent", this.on_settings_changed);
        this._classname = TRANSPARENT_THEME;
        Gettext.bindtextdomain(meta.uuid, GLib.get_home_dir() + "/.local/share/locale");
    },

    enable: function () {
        this.policy.enable();
        Main.getPanels().forEach(panel => this.make_transparent(panel, true));
        if (this.settings.getValue("first-launch")) {
            this.settings.setValue("first-launch", false);
            this._show_startup_notification();
        }
    },

    disable: function () {
        this.policy.disable();
        this.settings.finalize();
        this.settings = null;
        Main.getPanels().forEach(panel => this.make_transparent(panel, false));
    },

    on_state_change: function (monitor) {
        Main.getPanels().forEach(panel => {
            this.make_transparent(panel, this.alwaysTransparent);
        });
    },

    make_transparent: function (panel, transparent) {
        panel.actor.add_style_class_name(this._classname);
        this._set_background_opacity(panel, transparent ? 0 : 255);
        let idx = typeof panel.panelId === 'number' ? panel.panelId - 1 : 0;
        this._panel_status[idx] = transparent;
    },

    _set_background_opacity: function (panel, alpha) {
        let actor = panel.actor;
        let color = actor.get_background_color();

        color.red = DEFAULT_PANEL_COLOR.red;
        color.green = DEFAULT_PANEL_COLOR.green;
        color.blue = DEFAULT_PANEL_COLOR.blue;
        color.alpha = alpha;
        actor.save_easing_state();
        actor.set_easing_duration(ANIMATIONS_DURATION);
        actor.set_background_color(color);
        actor.restore_easing_state();
    },

    on_settings_changed: function () {
        this._classname = TRANSPARENT_THEME;
        Main.getPanels().forEach(panel => this.make_transparent(panel, this.alwaysTransparent));
        this.on_state_change(-1);
    },

    _show_startup_notification: function () {
        let source = new MessageTray.Source(this.meta.name);
        let params = {
            icon: new St.Icon({
                icon_name: "transparent-panels-reloaded",
                icon_type: St.IconType.FULLCOLOR,
                icon_size: source.ICON_SIZE
            })
        };

        let notification = new MessageTray.Notification(source,
            _("%s enabled").format(_(this.meta.name)),
            _("Open the extension settings and customize your panels"),
            params);

        notification.addButton("open-settings", _("Open settings"));
        notification.connect("action-invoked", () => this.launch_settings());

        Main.messageTray.add(source);
        source.notify(notification);
    },

    launch_settings: function () {
        Util.spawnCommandLine("xlet-settings extension " + this.meta.uuid);
    }
};


let extension = null;

function enable() {
    try {
        extension.enable();
    } catch (err) {
        extension.disable();
        throw err;
    }
}

function disable() {
    try {
        extension.disable();
    } catch (err) {
        global.logError(err);
    } finally {
        extension = null;
    }
}

function init(metadata) {
    extension = new MyExtension(metadata);
}
