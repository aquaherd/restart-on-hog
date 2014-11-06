
const St = imports.gi.St;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

let label, button, pid, timerid;
let maxRes = 1024; // 1 GB Max; make configurable
let maxVirt = 1024; // 1 GB Max; make configurable
let showRes = true; // make configurable
let showVirt = false; // make configurable

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
        let mb = fields[1];
        mb *= 4096; // page size in bytes
        mb /= (1024*1024); // bytes in a Megabyte
        // update display:
        label.text = '%.1f'.format(mb) + "m";
        
        // memory-overhog
        if(mb > (1024 * 1024 * 1024))
            _resetShell();
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
