all: rails.svg tiles

rails.svg: rails.pdf
	# Convert that PDF page to SVG.
	# _INKSCAPE_GC makes Inkscape work under WSL.
	_INKSCAPE_GC=disable inkscape --without-gui --file=$< --export-plain-svg=$@
	node_modules/.bin/svgo $@

rails.pdf: source.pdf
	# Get the fourth page of the PDF.
	pdftk $< cat 4 output $@

tiles: ground.ppm
	./tiles.py $< $@

ground.ppm: ground.pdf
	pdftoppm -singlefile $< > $@

ground.pdf: source.pdf
	# Get the fifth page of the PDF.
	pdftk $< cat 5 output $@

source.pdf:
	curl -L https://www.dropbox.com/s/hzwcw17v6xv13iz/TheArchipelagoMap.pdf > $@

clean:
	rm -f source.pdf rails.pdf rails.svg ground.ppm ground.pdf
.PHONY: clean all

#nope:
	#convert -crop 840x840 $< -set filename:tile "tile-%[fx:page.x]-%[fx:page.y]" "$@/%[filename:tile].jpg" 

