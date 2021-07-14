all: static/ground static/rails static/freight static/hills

static/hills: hillshading.png
	rm -rf static/hills/*
	vips dzsave $< $@ \
	  --layout google \
	  --suffix .jpg \
	  --tile-size 256 \
	  --background 0,0,0 \
	  --skip-blanks 160

static/freight: freight.ppm
	./tiles.py $< $@ .png

static/rails: rails.ppm
	./tiles.py $< $@ .png

static/ground: ground.ppm
	./tiles.py $< $@ .jpg

freight.ppm: src/freightnobackground.pdf
	pdftoppm -singlefile $< > $@

rails.ppm: rails.pdf
	pdftoppm -f 1 -r 300 -singlefile $< > $@

#ground.ppm: map5.pdf
#	pdftoppm -f 3 -singlefile $< > $@

clean:
	rm -f rails.ppm ground.ppm
.PHONY: clean all

#nope:
	#convert -crop 840x840 $< -set filename:tile "tile-%[fx:page.x]-%[fx:page.y]" "$@/%[filename:tile].jpg" 

	#pdftocairo -f 4 -transp -png -singlefile $< rails
