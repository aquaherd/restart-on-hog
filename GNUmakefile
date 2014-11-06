#!/bin/make -f

UUID = restart-on-hog@aquaherd.github.com
SOURCES = extension.js metadata.json stylesheet.css
EXTRAS = LICENSE README
PREFIX := ~/.local/share/gnome-shell/extensions
DESTDIR = $(PREFIX)/$(UUID)

default: install-local

package:
	rm -rvf $(UUID).zip
	zip -j $(UUID).zip $(SOURCES)

install-local:
	cp -vu $(SOURCES) $(DESTDIR)
	dbus-send \
		--dest=org.gnome.Shell \
		--type=method_call \
		/org/gnome/Shell \
		org.gnome.Shell.Extensions.ReloadExtension \
		string:'$(UUID)'
