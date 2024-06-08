// Usually, Leaflet uses lat/long as coordinates. At zoom level 0, the width of
// a single tile represents all 360 degrees of Earth.
//
// For our fictional map, we instead use a flat grid 24km square. At zoom level
// 0, the width of a single tile represents 24km.
//
// We don't need to invert the Y axis (unlike for some other games): our
// coordinates already go bottom-to-top.

const tileSize = 384
const f = tileSize/24
const inverseF = 1/f
const projection = {
	project: function (latlng) {
		return new L.Point(latlng.lng*f, (latlng.lat - 24)*f)
	},

	unproject: function (point) {
		return new L.LatLng(point.y*inverseF + 24, point.x*inverseF)
	},

	bounds: new L.Bounds([0, -tileSize], [tileSize, 0]),
};

const crs = L.extend(L.CRS.Simple, {
  infinite: false,
  projection,
})

// Note that at zoom level 0, the entire map will occupy 24 pixels.
const bounds = [
  [0, 0],
  [24, -24576],
]

// CRS.Simple almost does what we want, except for how it handles zoom levels.
//
// If we define our map bounds as 24 by 24, then at zoom level 0, our map would
// be 24 by 24 pixels square on screen!
// const zoomScale = 256/24
// const crs = L.extend(L.CRS.Simple, {
// 	scale(zoom) {
//       return Math.pow(2, zoom)*zoomScale;
// 	},
// 	zoom(scale) {
//       return Math.log(scale/zoomScale) / Math.LN2;
// 	},
// })

const defaultZoom = 0
const searchResultZoom = 3

// The map is 24 x 24 km.
// We render it at 256 * 1.5 * 2^6 = 24,576 pixels square.
// TODO

const yx = L.latLng
const xy = function (x, y) {
  // ref([x, y]);
  if (Array.isArray(x)) {
    return yx(x[1], x[0])
  }
  return yx(y, x) // When doing xy(x, y);
}

const TileLayer = L.TileLayer.extend({
  getTileUrl: function(tilecoords) {
    console.log(tilecoords)
    //tilecoords.x = tilecoords.x + 4;
    //tilecoords.y = tilecoords.y - 8;
    //tilecoords.z = tilecoords.z + 1;
    // This "works", but not if detectRetina is on.
    //tilecoords.y += Math.pow(2, tilecoords.z)
    return L.TileLayer.prototype.getTileUrl.call(this, tilecoords);
  },
  tileSize: 384,
})

const makeLayer = name =>
  new TileLayer(`/tiles/${name}/{z}/{y}/{x}.png`, {
  //new TileLayer(`/gentiles/${name}/{z}/{y}/{x}.png`, {

    // Display tiles at their native resolution.
    tileSize,

    // On a "retina" device (>1 devicePixelRatio), display tiles one zoom level
    // higher.
    detectRetina: true,

    // Do not try to fetch tiles at zoom 7+ since they don't exist.
    // 
    // This option interacts poorly with detectRetina; when that's in use, we
    // have to specify a max zoom level one *lower* or we will try and fetch
    // tiles that don't exist.
    maxNativeZoom: L.Browser.retina ? 5 : 6,

  })

const layerNames = {
  topo: "Topographic",
  rail: "Railway",
  road: "Road",
  full: "Complete",
}

const layers = {}
const layerOptions = {}
for (const [key, name] of Object.entries(layerNames)) {
  const layer = makeLayer(key)
  layers[key] = layer
  layerOptions[name] = layer
}

const map = L.map("map", {
  maxZoom: 6,

  crs,

  maxBounds: [[-24, -24], [48, 48] ],

  // One horizontal map unit is mapped to one horizontal pixel.
  // TODO

  layers: [],

  //controls: [
  //  layerControl,
  //],
  //minZoom: 4,
  //
}).setView([12, 12], 1)

const setLayer = layerKey => {
  for (const [key, layer] of Object.entries(layers)) {
    if (key === layerKey) {
      map.addLayer(layer)
    } else {
      map.removeLayer(layer)

    }
  }
}
setLayer('full')

//const image = L.imageOverlay('/tiles/full/0/0/0.png', bounds).addTo(map)

const layerControl = L.control.layers(layerOptions, {}, {
  collapsed: false,
})
layerControl.addTo(map)

map.attributionControl.setPrefix(
  'mapping &copy; <a href="//x.com/GarethDennis">Gareth Dennis</a> • viewer by <a href="//blob.codes/">blobby tables</a>'
)


map.on("moveend", e => {
  console.log(e)
})

map.on("mousemove", e => {
})

//sample data values for populate map
var data = [
  { loc: xy(24, 24), title: "topright" },
  { loc: xy(12, 12), title: "center" },
  { loc: [0, 0], title: "origin" },
]

var markersLayer = new L.LayerGroup() //layer contain searched elements

//map.addLayer(markersLayer)

var controlSearch = new L.Control.Search({
  position: "topright",
  layer: markersLayer,
  initial: false,
  zoom: searchResultZoom,
  marker: false,
  delayType: 0,
})

controlSearch.addTo(map)
map.removeLayer(markersLayer)

////////////populate map with markers from sample data
for (i in data) {
  var title = data[i].title, //value searched
    loc = data[i].loc, //position found
    marker = new L.Marker(new L.latLng(loc), { title: title }) //se property searched
  marker.bindPopup("title: " + title)
  markersLayer.addLayer(marker)
}

window.addEventListener("keypress", e => {
  switch (e.key) {
    case "/":
      controlSearch.expand()
      break
    default:
      return
  }
  e.preventDefault()
})
