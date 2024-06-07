import Feature from "ol/Feature.js"
import Layer from "ol/layer/Layer.js"
import Point from "ol/geom/Point.js"
import Map from "ol/Map.js"
import View from "ol/View.js"
import { composeCssTransform } from "ol/transform.js"
import { Icon, Fill, Stroke, Style, Text } from "ol/style.js"
import VectorLayer from "ol/layer/Vector.js"
import VectorSource from "ol/source/Vector.js"
import TileLayer from "ol/layer/Tile.js"
import XYZ from "ol/source/XYZ.js"
import Projection from "ol/proj/Projection.js"
import { Modify } from "ol/interaction.js"
import { createStringXY } from "ol/coordinate.js"
import { defaults as defaultControls } from "ol/control.js"
import MousePosition from "ol/control/MousePosition.js"

const groundOpacity = 0.5

const projection = new Projection({
  code: "amphitros",
  // The map is 24 x 24 km.
  extent: [0, 0, 24, 24],
  units: "pixels",
})


const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: projection,
})

function makeLayer(name) {
  return new TileLayer({
    source: new XYZ({
      url: `/tiles/${name}/{z}/{y}/{x}.png`,
      minZoom: 0,
      maxZoom: 6,
      //// We want transparency
      //transition: 0,
      wrapX: false,
      projection,
      zDirection: -1,
    }),
    //opacity: 0.4,
  })
}

const layerNames = {
  topo: "Topographic",
  rail: "Railway",
  road: "Road",
  full: "Complete",
}

const defaultLayer = 'full'

const layers = {}
for (const key of Object.keys(layerNames)) {
  layers[key] = makeLayer(key)
}

const target = document.getElementById("map")

const defaultZoom = 3
const defaultRestoreZoom = 5

let selectedLayer = defaultLayer

const view = new View({
  center: [12, 12],
  minZoom: 0,
  zoom: defaultZoom,
  maxZoom: 6, // display tiles at most 2x
  enableRotation: false,
  projection,
})

const map = new Map({
  controls: defaultControls().extend([mousePositionControl]),
  target,
  layers: [layers.full],
  view,
})

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

const selectLayer = (layer) => {
  selectedLayer = layer
  map.setLayers([layers[layer]])
  console.log(`selected ${layer}`)
}

const restoreState = () => {
  const m = /#?\@(-?[0-9.]+),(-?[0-9.]+)(?:,([0-9.]+)z(?:,(.*))?)?$/.exec(location.hash)
  if (!m) return false
  const x = +m[1]
  const y = +m[2]
  const z = +m[3] || defaultRestoreZoom
  const layer = m[4] || defaultLayer
  console.log(x,y,z)
  if (isNaN(x) || isNaN(y)) return false
  view.setCenter([x, y])
  view.setZoom(z)
  selectLayer(layer)
  layerDropdown.value = layer
  return true
}

const saveState = () => {
  const center = view.getCenter()
  const zoom = view.getZoom()
  const x = center[0]
  const y = center[1]
  window.history.replaceState(
    {},
    "",
    `#@${x.toFixed(3)},${y.toFixed(3)},${zoom.toFixed(2)}z,${selectedLayer}`
  )
}

if (!restoreState()) {
  saveState()
}
window.addEventListener("hashchange", e => {
  console.log('hashchange', e)
  if (!restoreState()) {
    saveState()
  }
})

map.on("moveend", saveState)

map.on("postrender", () => {
  document.querySelector("footer").style.opacity = view.getZoom() < 3 ? 1 : 0
})
window.ol = map
