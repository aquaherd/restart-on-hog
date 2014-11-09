#!/bin/make -f

PROJECT = restart-on-hog
UUID = $(PROJECT)@aquaherd.github.com
SOURCES = extension.js convenience.js metadata.json stylesheet.css
EXTRAS = LICENSE README
PREFIX := ~/.local
DESTDIR = $(PREFIX)/share/gnome-shell/extensions/$(UUID)
SCHEMA = org.gnome.shell.extensions.$(PROJECT).gschema.xml

default: install

package:
	rm -rvf $(UUID).zip
	zip -j $(UUID).zip $(SOURCES)

install: $(DESTDIR) $(DESTDIR)/schemas/gschemas.compiled
	cp -vu $(SOURCES) $(DESTDIR)
	dbus-send \
		--session \
		--dest=org.gnome.Shell \
		--type=method_call \
		/org/gnome/Shell \
		org.gnome.Shell.Extensions.ReloadExtension \
		string:'$(UUID)'

$(DESTDIR):
	mkdir -p $(DESTDIR)/schemas

$(DESTDIR)/schemas/gschemas.compiled: $(DESTDIR)/schemas/$(SCHEMA)
	glib-compile-schemas $(DESTDIR)/schemas

$(DESTDIR)/schemas/$(SCHEMA):
	cp -vu schemas/$(SCHEMA) $(DESTDIR)/schemas/

install-schema-root:
	sudo cp schemas/$(SCHEMA) /usr/share/glib-2.0/schemas
	sudo glib-compile-schemas /usr/share/glib-2.0/schemas
	
	
uninstall:
	rm -rvf $(DESTDIR)
