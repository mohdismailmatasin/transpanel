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

const DEFAULT_ANIMATIONS_DURATION = 200;
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
        this.settings.bind("panel-top-opacity", "panelTopOpacity", this.on_settings_changed);
        this.settings.bind("panel-bottom-opacity", "panelBottomOpacity", this.on_settings_changed);
        this.settings.bind("panel-left-opacity", "panelLeftOpacity", this.on_settings_changed);
        this.settings.bind("panel-right-opacity", "panelRightOpacity", this.on_settings_changed);
        this.settings.bind("maximized-opacity", "maximizedOpacity", this.on_settings_changed);
        this.settings.bind("animation-duration", "animationDuration", this.on_settings_changed);
        this._classname = TRANSPARENT_THEME;
        Gettext.bindtextdomain(meta.uuid, GLib.get_home_dir() + "/.local/share/locale");
    },

    enable: function () {
        this.policy.enable();
        Main.getPanels().forEach(panel => {
            this._update_panel_opacity(panel);
        });
        if (this.settings.getValue("first-launch")) {
            this.settings.setValue("first-launch", false);
            this._show_startup_notification();
        }
    },

    disable: function () {
        try {
            if (this.policy) {
                this.policy.disable();
            }
            if (this.settings) {
                this.settings.finalize();
                this.settings = null;
            }
            Main.getPanels().forEach(panel => this._reset_panel_opacity(panel));
        } catch (err) {
            global.logError("Error disabling Transpanel extension: " + err);
        }
    },

    _reset_panel_opacity: function (panel) {
        try {
            if (panel && panel.actor) {
                panel.actor.remove_style_class_name(this._classname);
                this._set_background_opacity(panel, 255); // Fully opaque
                let idx = typeof panel.panelId === 'number' ? panel.panelId - 1 : 0;
                if (idx >= 0 && idx < this._panel_status.length) {
                    this._panel_status[idx] = false;
                }
            }
        } catch (err) {
            global.logError("Error resetting panel opacity: " + err);
        }
    },

    on_state_change: function (monitor) {
        Main.getPanels().forEach(panel => {
            this._update_panel_opacity(panel);
        });
    },

    _update_panel_opacity: function (panel) {
        try {
            if (panel && panel.actor) {
                panel.actor.add_style_class_name(this._classname);
                let opacity = this._get_panel_opacity(panel);
                this._set_background_opacity(panel, opacity);
                let idx = typeof panel.panelId === 'number' ? panel.panelId - 1 : 0;
                if (idx >= 0 && idx < this._panel_status.length) {
                    this._panel_status[idx] = opacity < 255;
                }
            }
        } catch (err) {
            global.logError("Error updating panel opacity: " + err);
        }
    },

    _get_panel_opacity: function (panel) {
        let opacityPercent = this._get_panel_opacity_setting(panel);

        // If always transparent is disabled and there's a maximized window, use maximized opacity
        if (!this.alwaysTransparent && !this.policy.is_transparent(panel)) {
            opacityPercent = this.maximizedOpacity || 80;
        }

        // Convert percentage (0-100) to alpha value (0-255)
        return Math.round((opacityPercent / 100) * 255);
    },

    _get_panel_opacity_setting: function (panel) {
        // panel.panelPosition: 0=top, 1=bottom, 2=left, 3=right
        switch(panel.panelPosition) {
            case 0: return this.panelTopOpacity || 0;
            case 1: return this.panelBottomOpacity || 0;
            case 2: return this.panelLeftOpacity || 0;
            case 3: return this.panelRightOpacity || 0;
            default: return 0;
        }
    },

    make_transparent: function (panel, transparent) {
        // Legacy function for backward compatibility
        this._update_panel_opacity(panel);
    },

    _set_background_opacity: function (panel, alpha) {
        let actor = panel.actor;
        let color = actor.get_background_color();

        color.red = DEFAULT_PANEL_COLOR.red;
        color.green = DEFAULT_PANEL_COLOR.green;
        color.blue = DEFAULT_PANEL_COLOR.blue;
        color.alpha = alpha;
        actor.save_easing_state();
        actor.set_easing_duration(this.animationDuration || DEFAULT_ANIMATIONS_DURATION);
        actor.set_background_color(color);
        actor.restore_easing_state();
    },

    on_settings_changed: function () {
        this._classname = TRANSPARENT_THEME;
        Main.getPanels().forEach(panel => {
            this._update_panel_opacity(panel);
        });
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
        global.logError("Transpanel extension enable error: " + err);
        if (extension) {
            extension.disable();
        }
        throw err;
    }
}

function disable() {
    try {
        if (extension) {
            extension.disable();
        }
    } catch (err) {
        global.logError("Transpanel extension disable error: " + err);
    } finally {
        extension = null;
    }
}

function init(metadata) {
    extension = new MyExtension(metadata);
}
