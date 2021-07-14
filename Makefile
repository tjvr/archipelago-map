all: static/ground static/rails static/freight static/hills

static/hills: src/hillshading.png
	rm -rf $@/*
	vips dzsave $< $@ \
	  --overlap 0 \
	  --layout google \
	  --suffix .jpg \
	  --tile-size 256 \
	  --background 0,0,0 \
	  --skip-blanks 160 \
	  --depth onetile

static/rails: tmp/rails-alpha.png
	rm -rf $@/*
	vips dzsave $< $@ \
	  --overlap 0 \
	  --layout google \
	  --suffix .png \
	  --tile-size 256 \
	  --background 0,0,0,0 \
	  --skip-blanks 40 \
	  --depth onetile

tmp/rails-alpha.png: tmp/rails.ppm
	./guess_alpha_and_resize.py $< $@

tmp/rails.ppm: src/rails.pdf
	pdftoppm -f 1 -r 300 -singlefile $< > $@

static/freight: tmp/freight-alpha.png
	rm -rf $@/*
	vips dzsave $< $@ \
	  --overlap 0 \
	  --layout google \
	  --suffix .png \
	  --tile-size 256 \
	  --background 0,0,0,0 \
	  --skip-blanks 40

tmp/freight-alpha.png: tmp/freight.ppm
	./guess_alpha_and_resize.py $< $@

tmp/freight.ppm: src/freightnobackground.pdf
	pdftoppm -singlefile $< > $@

clean:
	rm -rf tmp
.PHONY: clean all

#nope:
	#convert -crop 840x840 $< -set filename:tile "tile-%[fx:page.x]-%[fx:page.y]" "$@/%[filename:tile].jpg" 

	#pdftocairo -f 4 -transp -png -singlefile $< rails
