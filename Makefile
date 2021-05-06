all: static/ground static/rails static/freight

rails.pdf: source.pdf
	# Get the fourth page of the PDF.
	pdftk $< cat 4 output $@

static/freight: freight.ppm
	./tiles.py $< $@ .png

static/rails: rails.ppm
	./tiles.py $< $@ .png

static/ground: ground.ppm
	./tiles.py $< $@ .jpg

freight.ppm: src/freightnobackground.pdf
	pdftoppm -singlefile $< > $@

rails.ppm: TheArchipelagoMap4.pdf
	pdftoppm -f 1 -r 300 -singlefile $< > $@

ground.ppm: source.pdf
	pdftoppm -f 3 -singlefile $< > $@

source.pdf:
	curl -L https://www.dropbox.com/s/uccbzj05ouy4p6w/mapupdates.pdf > $@

clean:
	rm -f source.pdf rails.ppm ground.ppm
.PHONY: clean all

#nope:
	#convert -crop 840x840 $< -set filename:tile "tile-%[fx:page.x]-%[fx:page.y]" "$@/%[filename:tile].jpg" 

	#pdftocairo -f 4 -transp -png -singlefile $< rails
