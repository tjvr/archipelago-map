// Unlike the Earth, our entire map is 24 x 24 km.
//
// TileLayers are hard to scale, so instead we define a custom projection.
//
// TileLayers have the origin in the top-left, and a pixel size equal to the
// tile size (384px in our case).
//
// Our projection transforms this so that the origin is the bottom-left, with
// coordinates in km, with the top-right at [24, 24].
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
}

const crs = L.extend({}, L.CRS.Simple, {
  infinite: false,
  projection,

  // The scale control expects distances in metres, not km.
  distance: (a, b) => {
    return L.CRS.Simple.distance(a, b) * 1000
  },
})

const makeLayer = name =>
  new L.TileLayer(`/tiles/${name}/{z}/{y}/{x}.png`, {
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
  '1953-full': "1953 AMA Second Series 1:10000",
  '1953-rail': "1953 AMA Railway Gazeteer",
  '1953-rail-dark': "1953 Dark railway map",
  'topo': "Geographic",
}

const map = L.map("map", {
  maxZoom: 6,
  crs,
  // Make sure you can't scroll the archipelago out of view.
  maxBounds: [[-24, -24], [48, 48] ],
})

let selectedLayer

const selectLayer = layerKey => {
  for (const [key, layer] of Object.entries(layers)) {
    if (key === layerKey) {
      map.addLayer(layer)
    } else {
      map.removeLayer(layer)
    }
  }
  layerDropdown.value = layerKey
  selectedLayer = layerKey

  map._container.style.background = /dark/.test(layerKey) ? '#000' : '#d8f8f8'
}


/* Attribution in bottom-right */

map.attributionControl.setPrefix(
  'mapping &copy; <a href="//x.com/GarethDennis">Gareth Dennis</a> • viewer by <a href="//blob.codes/">blobby tables</a>'
)


/* Scale bar in bottom-left */

L.control.scale({
  imperial: false,
}).addTo(map)


/* Layer selection dropdown */

const layers = {}
const layerOptions = {}
for (const [key, name] of Object.entries(layerNames)) {
  const layer = makeLayer(key)
  layers[key] = layer
  layerOptions[name] = layer
}

// Use a custom dropdown control, rather than L.control.layers, because its
// more accessible on mobile.
const layerDropdown = document.getElementById("layer")

for (const key of Object.keys(layerNames)) {
  const option = document.createElement("option")
  option.textContent = layerNames[key]
  option.value = key
  layerDropdown.appendChild(option)
}

layerDropdown.addEventListener("change", e => {
  selectLayer(layerDropdown.value)
  saveState()
})


/* Show mouse position in bottom-right */

const MousePosition = L.Control.extend({
  options: {
    position: 'bottomright',
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition')
    L.DomEvent.disableClickPropagation(this._container)
    this._label = document.createTextNode("")
    this._container.appendChild(this._label)
    L.DomEvent.disableClickPropagation(this._container)
    map.on('mousemove', this._onMouseMove, this)
    return this._container
  },

  setLabel: function(label)  {
  },

  onRemove: function (map) {
    map.off('mousemove', this._onMouseMove)
  },

  _onMouseMove: function (e) {
    const {lng: x, lat: y} = e.latlng
    this._label.textContent = inBounds(e.latlng) ? formatXY(e.latlng) : ''
  }
})

const inBounds = latlng => {
  const {lng: x, lat: y} = latlng
  const ib = value => (0 <= value && value <= 24)
  return ib(x) && ib(y)
}

const formatXY = (latlng, precision = 2) => {
  const {lng: x, lat: y} = latlng
  const fmt = (value) => value.toFixed(precision).replace('.', '').padStart(2+precision, '0')
  return `${fmt(x)} ${fmt(y)}`
}

const posControl = new MousePosition()
posControl.addTo(map)


/* Search map with autocomplete */

const yx = L.latLng
const xy = function (x, y) {
  // ref([x, y])
  if (Array.isArray(x)) {
    return yx(x[1], x[0])
  }
  return yx(y, x) // When doing xy(x, y)
}

const searchInput = document.getElementById('search')
const autocomplete = document.getElementById('autocomplete')
searchInput.addEventListener('focus', updateResults)
searchInput.addEventListener('input', updateResults)
searchInput.addEventListener('blur', e => {
  hideResults()
})
searchInput.addEventListener('keydown', e => {
  switch (e.keyCode) { 
    case 27: // Escape.
      searchInput.blur()
      break
    case 40: // Down arrow.
      if (autocompleteState.selectedIndex == null) return
      autocompleteState.selectedIndex = Math.min(autocompleteState.results.length - 1, autocompleteState.selectedIndex + 1)
      redrawResults()
      break
    case 38: // Up arrow.
      if (autocompleteState.selectedIndex == null) return
      autocompleteState.selectedIndex = Math.max(0, autocompleteState.selectedIndex - 1)
      redrawResults()
      break
    default:
      return
  }
  e.preventDefault()
})
autocomplete.style.visibility = 'hidden'

let autocompleteState = null

const searchPoints = [
  {title: "Bradshaw", loc: xy(17.2470703125, 7.53515625), zoom: 4},
  {title: "Vorioslimin", loc: xy(12.2275390625, 19.451171875), zoom: 4},
  {title: "Shanklin", loc: xy(6.34, 8.8), zoom: 4},
  {title: "Anapolis", loc: xy(18.08, 9.82), zoom: 4},
  {title: "Thapste", loc: xy(18.63, 15.33), zoom: 4},
]

const reEscape = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

function parseRef(query) {
  const m = /([0-9]+)(?:\s+([0-9]*))?/.exec(query)
  if (m == null) return
  let x = m[1]
  if (x.length < 2) x += "0"
  const digitCount = x.length
  let y = m[2] ||  Array(digitCount).fill("0").join("")
  if (y.length < digitCount) y += "0"
  const precision = digitCount - 2

  const xn = +(x.slice(0, 2) + "." + x.slice(2))
  const yn = +(y.slice(0, 2) + "." + y.slice(2))

  const loc = xy(xn, yn)
  if (!inBounds(loc)) return
  return {
    title: formatXY(loc, precision),
    loc,
    zoom: Math.min(4+precision*2, map.options.maxZoom),
  }
}

const fuse = new Fuse(searchPoints, {
  keys: ['title'],
})

function getSearchResults(query) {
  // Bad fuzzy search.
  const pat = Array.from(query).map(reEscape).join(".*")
  const re = new RegExp(pat, 'ig') 
  const reAnchor = new RegExp('^'+pat, 'ig') 

  const results = []

  if (query.trim() === '') {
    return {
      results: [{title: "…"}],
      selectedIndex: null,
    }
  }

  const ref = parseRef(query)
  if (ref != null) {
    return {
      results: [ref],
      selectedIndex: 0,
    }
  }

  return {
    results: fuse.search(query).map(result => result.item),
    selectedIndex: 0,
  }
}

function updateResults() {
  autocompleteState = getSearchResults(searchInput.value)

  if (autocompleteState.results.length === 0) return

  autocomplete.style.visibility = 'visible'
  searchInput.placeholder = "Place or grid ref"
  redrawResults()
}

function hideResults() {
  autocomplete.style.visibility = 'hidden'
  searchInput.placeholder = "Search"
}

function redrawResults() {
  const { results, selectedIndex } = autocompleteState

  autocomplete.textContent = ''

  for (let i = 0; i < results.length; i++) {
    const outer = document.createElement('li')
    const el = document.createElement('a')
    el.textContent = results[i].title
    if (i === selectedIndex) {
      el.classList.add('selected')
    }
    // Can't use click, since pressing down on the autocomplete unfocuses the
    // search input, which hides the autocomplete! 
    el.addEventListener('pointerdown', e => {
      if (autocompleteState.selectedIndex == null) return
      selectResult(results[i])
    })
    el.addEventListener('pointerover', e => {
      if (autocompleteState.selectedIndex == null) return
      if (autocompleteState.selectedIndex !== i) {
        autocompleteState.selectedIndex = i
        redrawResults()
      }
      e.stopPropagation()
    })
    outer.appendChild(el)
    autocomplete.appendChild(outer)
  }
}

function selectResult(result) {
  map.flyTo(result.loc, result.zoom, {
    duration: 0.5,
  })
  searchInput.value = ""
  searchInput.blur()

  const {lng: x, lat: y} = result.loc
  const zoom = result.zoom
  window.history.pushState(
    {},
    "",
    `#@${x.toFixed(3)},${y.toFixed(3)},${zoom.toFixed(2)}z,${selectedLayer}`
  )
}

const form = document.getElementById('controls')
form.addEventListener('submit', e => {
  e.preventDefault()
  if (autocompleteState != null) {
    selectResult(autocompleteState.results[autocompleteState.selectedIndex])
  }
})

window.addEventListener("keypress", e => {
  switch (e.key) {
    case "/":
      searchInput.focus()
      break
    default:
      return
  }
  e.preventDefault()
})


/* Store map state in URL bar */

const restoreState = (animate = false) => {
  const m = /#?\@(-?[0-9.]+),(-?[0-9.]+)(?:,([0-9.]+)z(?:,(.*))?)?$/.exec(location.hash)
  if (!m) return false
  const x = +m[1]
  const y = +m[2]
  const z = +(m[3] ?? defaultRestoreZoom)
  let layer = m[4] || defaultLayer
  if (layerNames[layer] == null) {
    layer = defaultLayer
  }
  if (isNaN(x) || isNaN(y)) return false
  selectLayer(layer)
  if (animate) {
    map.flyTo(xy(x, y), z, {
      duration: 0.5,
    })
  } else {
    map.setView(xy(x, y), z)
  }
  layerDropdown.value = layer
  return true
}

const saveState = () => {
  const {lng: x, lat: y} = map.getCenter()
  const zoom = map.getZoom()
  window.history.replaceState(
    {},
    "",
    `#@${x.toFixed(3)},${y.toFixed(3)},${zoom.toFixed(2)}z,${selectedLayer}`
  )
}

window.addEventListener("hashchange", e => {
  if (!restoreState(true)) {
    saveState()
  }
})

const defaultLayer = '1953-full'
const defaultRestoreZoom = 4

if (!restoreState()) {
  map.setView([12, 12], 0)
  selectLayer(defaultLayer)
  saveState()
}

map.on("moveend", e => {
  saveState()
})

