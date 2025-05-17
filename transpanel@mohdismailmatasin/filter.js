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

const Main = imports.ui.main;

function PanelFilter() {}

PanelFilter.prototype = {
    _init: function () {},
    for_each_panel: function (callback, monitor) {
        Main.getPanels().forEach(panel => {
            if (monitor < 0 || panel.monitorIndex === monitor)
                callback(panel, monitor);
        });
    }
};
