all: static/ground static/rails

rails.svg: rails.pdf
	# Convert that PDF page to SVG.
	# _INKSCAPE_GC makes Inkscape work under WSL.
	_INKSCAPE_GC=disable inkscape --without-gui --file=$< --export-plain-svg=$@
	node_modules/.bin/svgo $@

rails.pdf: source.pdf
	# Get the fourth page of the PDF.
	pdftk $< cat 4 output $@

static/rails: rails.ppm
	./tiles.py $< $@ .png

static/ground: ground.ppm
	./tiles.py $< $@ .jpg

rails.ppm: source.pdf
	pdftoppm -f 4 -singlefile $< > $@

ground.ppm: source.pdf
	pdftoppm -f 5 -singlefile $< > $@

source.pdf:
	curl -L https://www.dropbox.com/s/hzwcw17v6xv13iz/TheArchipelagoMap.pdf > $@

clean:
	rm -f source.pdf rails.ppm ground.ppm
.PHONY: clean all

#nope:
	#convert -crop 840x840 $< -set filename:tile "tile-%[fx:page.x]-%[fx:page.y]" "$@/%[filename:tile].jpg" 

	#pdftocairo -f 4 -transp -png -singlefile $< rails
