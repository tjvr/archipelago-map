all: static/ground static/rails static/freight

static/hills: hillshading.png
	vips dzsave hillshading.png static/hills --layout google --suffix .jpg --tile-size 256

static/freight: freight.ppm
	./tiles.py $< $@ .png

static/rails: rails.ppm
	./tiles.py $< $@ .png

static/ground: ground.ppm
	./tiles.py $< $@ .jpg

static/hills: hillshading.png
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
