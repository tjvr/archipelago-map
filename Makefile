all: static/ground static/rails static/freight static/hills static/labels
.PHONY: all

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
	pdftoppm -r 300 -singlefile $< > $@

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
tmp/freight.ppm: src/freight.pdf
	pdftoppm -singlefile $< > $@

static/labels: tmp/labels-alpha.png
	rm -rf $@/*
	vips dzsave $< $@ \
	  --overlap 0 \
	  --layout google \
	  --suffix .png \
	  --tile-size 256 \
	  --background 0,0,0,0 \
	  --skip-blanks 40
tmp/labels-alpha.png: tmp/labels.ppm
	./guess_alpha_and_resize.py $< $@
tmp/labels.ppm: src/labels.pdf
	pdftoppm -r 300 -singlefile $< > $@

static/ground: tmp/ground-scaled.png
	rm -rf $@/*
	vips dzsave $< $@ \
	  --overlap 0 \
	  --layout google \
	  --suffix .jpg \
	  --tile-size 256 \
	  --background 0,20,45
tmp/ground-scaled.png: tmp/ground.ppm
	vips resize $< $@ 0.97523809523
tmp/ground.ppm: src/ground.pdf
	pdftoppm -singlefile -r 300 $< > $@

clean:
	rm -rf tmp/*
.PHONY: clean
