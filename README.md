# Transparent Panels Reloaded

A Cinnamon desktop extension that makes your panels transparent with fine-grained opacity control for each panel individually.

## Features

### 🎛️ Individual Panel Opacity Control
- **Separate opacity sliders** for each panel position (top, bottom, left, right)
- **Percentage-based control** from 0% (fully transparent) to 100% (fully opaque)
- **5% step increments** for precise control

### 🪟 Smart Window Detection
- **Maximized window opacity**: Different opacity when windows are maximized
- **Always transparent mode**: Override window detection behavior
- **Per-monitor support**: Works correctly with multiple monitors

### ⚡ Advanced Settings
- **Customizable animation duration**: Control how fast opacity changes occur (0-1000ms)
- **Smooth transitions**: Animated opacity changes for better visual experience
- **Real-time updates**: Changes apply immediately without restart

### 🎨 Enhanced User Experience
- **Intuitive settings interface** with clear descriptions
- **Backward compatibility** with existing configurations
- **Startup notification** for first-time users
- **Easy access** to settings via notification

## Installation

1. Download or clone this extension
2. Copy to `~/.local/share/cinnamon/extensions/transpanel@mohdismailmatasin/`
3. Enable the extension in Cinnamon Settings > Extensions
4. Configure via the extension settings

## Configuration Options

### Panel Opacity Settings
- **Top Panel Opacity**: 0-100% (default: 0%)
- **Bottom Panel Opacity**: 0-100% (default: 0%)
- **Left Panel Opacity**: 0-100% (default: 0%)
- **Right Panel Opacity**: 0-100% (default: 0%)

### Advanced Settings
- **Maximized Window Opacity**: 0-100% (default: 80%)
- **Animation Duration**: 0-1000ms (default: 200ms)
- **Always Transparent**: Override window detection (default: enabled)

## Usage Examples

### Scenario 1: Subtle Transparency
- Set all panels to 20% opacity for a subtle see-through effect
- Use 60% opacity when windows are maximized for better readability

### Scenario 2: Gaming Setup
- Set panels to 0% opacity for maximum screen real estate
- Use 100% opacity when windows are maximized for full visibility

### Scenario 3: Productivity Setup
- Top panel: 30% opacity (for clock/system tray visibility)
- Bottom panel: 10% opacity (minimal distraction)
- Side panels: 0% opacity (maximum workspace)

### Scenario 4: Custom Per-Panel
- Top panel: 50% (status information)
- Bottom panel: 0% (taskbar hidden)
- Left panel: 25% (app launcher)
- Right panel: 75% (system controls)

## Troubleshooting

### Panels Not Changing Opacity
1. Check if the extension is enabled
2. Verify panel position settings match your setup
3. Try disabling/re-enabling the extension

### Animation Issues
1. Reduce animation duration if transitions feel slow
2. Set to 0ms for instant changes
3. Check system performance settings

### Settings Not Saving
1. Ensure proper file permissions
2. Check Cinnamon logs for errors
3. Try resetting to defaults

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

## Credits

- Original concept and implementation
- Enhanced with individual panel opacity controls
- Community feedback and testing

---

**Author:** Mohd Ismail Mat Asin
