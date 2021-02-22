
rails.svg: rails.pdf
	# Convert that PDF page to SVG.
	# _INKSCAPE_GC makes Inkscape work under WSL.
	_INKSCAPE_GC=disable inkscape --without-gui --file=$< --export-plain-svg=$@
	node_modules/.bin/svgo $@

rails.pdf: source.pdf
	# Get the third page of the PDF. 
	pdftk $< cat 3 output $@

source.pdf:
	curl -L https://www.dropbox.com/s/hzwcw17v6xv13iz/TheArchipelagoMap.pdf > $@

clean:
	rm -f source.pdf rails.pdf rails.svg
.PHONY: clean

