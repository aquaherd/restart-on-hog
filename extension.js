
const St = imports.gi.St;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

let text, label, button, pid, timerid;

function _hideHogWatch() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _resetShell() {
    global.reexec_self();
}

/**
 * Timer interval; check memory
 */
function _onCheckMem() {
    if(0 == pid)
        return;
        
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
 * This is the most convoluted way to get gnome-shell's pid.
 * Maybe there is a better way.
 */
function _setpid() {
    let file=Gio.file_new_for_path("/proc");
    file.enumerate_children_async(Gio.FILE_ATTRIBUTE_STANDARD_NAME,
                                  Gio.FileQueryInfoFlags.NONE,
                                  GLib.PRIORITY_LOW, null, function (obj, res) {
        let enumerator = obj.enumerate_children_finish(res);
        function onNextProcComplete(obj, res) {
            let files = obj.next_files_finish(res);
            if (files.length) {
                for(let fi = 0; fi < files.length; fi++)
                {
                    let f=files[fi];
                    let st="/proc/" + f.get_name() + "/stat";
                    if (GLib.file_test(st, GLib.FileTest.IS_REGULAR)) {
                        let fc=GLib.file_get_contents(st);
                        if(fc[0])
                        {
                            let fields=fc[1].toString().split(' ');
                            if(fields[1] == "(gnome-shell)")
                            {
                                // pid has been found
                                pid = fields[0];
                                // no need to enumerate further
                                enumerator.close(null);
                                enumerator = null;
                                files=null;
                                return;
                            }
                        }
                    }
                }
                enumerator.next_files_async(100, GLib.PRIORITY_LOW, null, onNextProcComplete);
            } else {
                enumerator.close(null);
                enumerator = null;
            }
        }
        enumerator.next_files_async(100, GLib.PRIORITY_LOW, null, onNextProcComplete);
    });
    file.unref();
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
