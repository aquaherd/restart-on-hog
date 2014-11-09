
const St = imports.gi.St;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

let label, button, pid, timerid;
let maxRss = 1024; // 1 GB Max; make configurable
let maxVms = 4096; // 4 GB Max; make configurable
let showRss = true; // make configurable
let showVms = false; // make configurable
let settings = null;

function _resetShell() {
    global.reexec_self();
}

/**
 * Timer interval; check memory
 */
function _onCheckMem() {
    if(0 == pid)
        return true;
        
    let stm="/proc/" + pid + "/statm";
    let fcm=GLib.file_get_contents(stm);
    if(fcm[0])
    {
        let fields=fcm[1].toString().split(' ');
        // update display:
        let text = "";
        if(showRss)
        {
			let rss = fields[1];
			rss *= 4096; // page size in bytes
			rss /= (1024*1024); // bytes in a Megabyte
			// memory-overhog
			if(rss > (maxRss * 1024 * 1024))
				_resetShell();
			text += '%.1f'.format(rss) + "m";
		}
		if(showRss && showVms)
			text += " ";
		if(showVms)
		{
			let vms = fields[0];
			vms *= 4096; 
			vms /= (1024*1024)
			// memory-overhog
			if(rss > (maxRss * 1024 * 1024))
				_resetShell();
			text += '%1.1f'.format(vms) + "m";
        }
        
        // update label, avoid uneccesary refreshes
        if(label.text != text)
			label.text = text;
    }
    return true;
}

/**
 * This is the second most convoluted way to get gnome-shell's pid.
 * Maybe there is a better way.
 */
function _setpid() {
	let creds = new Gio.Credentials(); 
	pid = creds.get_unix_pid();	
	creds.unref;
}

function init() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });

    label = new St.Label({ text: "..." });
    button.set_child(label);
    button.connect('button-press-event', _resetShell);
    
    settings = Convenience.getSettings();
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
    pid = 0;
    _setpid();
    timerid = Mainloop.timeout_add(1000, _onCheckMem);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
    Mainloop.source_remove(timerid);
}
