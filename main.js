import "ol/ol.css"
import Feature from "ol/Feature"
import Layer from "ol/layer/Layer"
import Point from "ol/geom/Point"
import Map from "ol/Map"
import View from "ol/View"
import { composeCssTransform } from "ol/transform"
import { Icon, Fill, Stroke, Style, Text } from "ol/style"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import TileLayer from "ol/layer/Tile"
import XYZ from "ol/source/XYZ"
import { Modify } from "ol/interaction"

const groundOpacity = 0.3

const groundLayer = new TileLayer({
  source: new XYZ({
    url: "./ground/{z}/{x}/{y}.jpg",
    minZoom: 0,
    maxZoom: 5,
    // transition and opacity like to fight
    transition: 0,
    wrapX: false,
  }),
  opacity: groundOpacity,
})

const railsLayer = new TileLayer({
  source: new XYZ({
    url: "./rails/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 6,
    // We want transparency
    transition: 0,
    wrapX: false,
  }),
})

const freightLayer = new TileLayer({
  source: new XYZ({
    url: "./freight/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 5,
    // We want transparency
    transition: 0,
    wrapX: false,
  }),
  opacity: 0.8,
  visible: false,
})

const destinations = [
  [[58.857393585379704, 8.029051320682434], "Ashbourne"],
  [[-101.07963826503743, 26.983790383557437], "Blackpool"],
  [[103.98604171542107, -53.96367178558295], "Bodmin"],
  [[71.80855802232973, -63.14458802716806], "BRADSHAW"],
  [[25.472032793679965, -31.67979858241558], "Bridport"],
  [[-151.22457796032384, 20.635824291558585], "Bristol"],
  //[[-93.2811256341133, 7.673403548586084], "Bungay Junction"],
  [[105.93070902105771, 74.15486956662016], "Bury"],
  [[-63.468603191239566, 100.32513535906794], "Chesterfield"],
  [[-4.375109938366542, -36.608174112460496], "Corby"],
  [[34.81861666819915, 133.13799840421567], "Crowle"],
  [[-21.903996406719976, 122.99739846972537], "Dorchester"],
  [[-26.46271076585097, -99.85895607850966], "Droitwich Spa"],
  [[157.0856229019735, -90.10174521099111], "Ellesmere"],
  [[-88.45506970598368, -5.631785917174703], "Elliotsburgh"],
  [[23.851044424243405, -89.76469493657234], "Ely"],
  [[90.05024134132293, -106.14636991620708], "Finsbury"],
  [[-102.15459084009673, -78.69801134493858], "Flitwick"],
  [[142.2725063392218, 21.569477653787416], "Framlingham"],
  [[-98.38437097739406, 149.56466684962083], "Frome"],
  [[25.46873141815521, -60.040627349051576], "Guisborough"],
  //[[116.56369740402104, 24.658056117689995], "Halewood Co"],
  [[-50.698153259459815, -40.493801791797885], "Harrogate"],
  [[72.14815115121992, 94.53149831677493], "Hartlepool"],
  [[83.61204017968834, 61.60937866088331], "Haverhill"],
  [[89.71326476386257, 33.63370620718631], "Hendon"],
  [[-44.80329086398058, 137.1923231322147], "Hexham"],
  [[22.278988750009006, 65.97086405144266], "Ipswich"],
  [[80.91925823186124, -30.440858011057415], "Kingston"],
  [[-24.003765398817478, -77.1282175299483], "Knottingley"],
  [[-80.57961842572169, -96.86155649721158], "Leyton"],
  [[132.43332386274128, -79.09689101980054], "Liverpool"],
  [[83.91332230464988, -140.10616059380902], "London"],
  [[4.113536138186262, 135.28187032479363], "Lowestoft"],
  [[18.43873778806026, 13.00745243778308], "Maghull"],
  [[67.55702401980012, -92.23389846178371], "Market Harbourough"],
  [[-51.91823077696838, -8.107885713846965], "Matlock"],
  [[108.54466447235271, -134.55447031116734], "Mayburgh"],
  [[23.89221061231848, 109.33208127274662], "Melksham"],
  [[-19.98696294266243, 88.12148490783832], "Morecambe"],
  [[-147.22778397795156, 50.7108321934315], "Orpington"],
  [[-27.884502081949197, -14.075754653285568], "Paignton"],
  [[-96.69479371198763, 105.10735266584933], "Rayleigh"],
  [[49.26415670935911, -39.93269156566679], "Richmond"],
  [[39.54010328917441, 36.741267554822656], "Rugeley"],
  [[-101.4678155287825, -42.917033634687556], "Shanklin"],
  [[-98.6933127714737, 60.559740294417715], "Shepshed"],
  [[91.73692177353637, -78.58905619902066], "Shildon"],
  [[-134.57613858696837, 1.352380125297934], "Southport"],
  [[43.25264894658088, -13.144228745223703], "Stamford"],
  [[-129.42590194629003, 29.61879517646262], "Stevenage"],
  [[-13.89298334727036, 60.86223665471799], "Stratford"],
  [[46.73666803195333, 85.53834677230032], "Wakefield"],
  [[-62.16492416908189, 43.07410063146696], "Wooler"],
]

const featureScale = 112000

const features = destinations.map(
  ([[x, y], name]) =>
    new Feature({
      geometry: new Point([x * featureScale, y * featureScale]),
      name,
    })
)

const labelStyle = new Style({
  text: new Text({
    font: "18px sans-serif",
    fill: new Fill({
      color: "#fff",
    }),
    padding: [36, 36, 36, 36],
  }),
})

const fillStyle = new Style({})

const citiesSource = new VectorSource({
  features,
  wrapX: false,
})
const citiesLayer = new VectorLayer({
  source: citiesSource,
  style: feature => {
    labelStyle.getText().setText(feature.get("name"))
    return [fillStyle, labelStyle]
  },
  declutter: true,
})

const dropdown = document.getElementById("dropdown")
const railsCheckbox = document.getElementById("rails")
const groundCheckbox = document.getElementById("ground")
const freightCheckbox = document.getElementById("freight")

for (let [[x, y], name] of destinations) {
  const option = document.createElement("option")
  option.textContent = name
  option.value = `${x},${y}`
  dropdown.appendChild(option)
}

dropdown.addEventListener("change", e => {
  const [x, y] = dropdown.value.split(",")
  view.setZoom(5)
  const size = map.getSize()
  const [width, height] = size
  view.centerOn([x * featureScale, y * featureScale], size, [width / 2, height / 2])
})

dropdown.focus()

const target = document.getElementById("map")

const view = new View({
  center: [0, 0],
  minZoom: 0,
  zoom: 0,
  maxZoom: 6,
  enableRotation: false,
})

const map = new Map({
  target,
  layers: [groundLayer, freightLayer, railsLayer, citiesLayer], //, citiesLayer],
  view,
})

const updateLayers = () => {
  railsLayer.setVisible(railsCheckbox.checked)
  groundLayer.setVisible(groundCheckbox.checked)
  freightLayer.setVisible(freightCheckbox.checked)
  groundLayer.setOpacity(railsCheckbox.checked || freightCheckbox.checked ? groundOpacity : 1)
}

const restoreState = () => {
  const m = /#?\@(-?[0-9.]+),(-?[0-9.]+),([0-9.]+)z,(.*)$/.exec(location.hash)
  if (!m) return false
  const x = +m[1]
  const y = +m[2]
  const z = +m[3]
  const layers = m[4].split(",")
  if (isNaN(x) || isNaN(y) || isNaN(z)) return false
  view.setCenter([x * featureScale, y * featureScale])
  view.setZoom(z)
  railsCheckbox.checked = layers.find(x => x == "rails")
  groundCheckbox.checked = layers.find(x => x == "ground")
  freightCheckbox.checked = layers.find(x => x == "freight")
  updateLayers()
  return true
}

const saveState = () => {
  const center = view.getCenter()
  const zoom = view.getZoom()
  const x = center[0] / featureScale
  const y = center[1] / featureScale
  const layerIDs = []
  if (groundLayer.getVisible()) layerIDs.push("ground")
  if (railsLayer.getVisible()) layerIDs.push("rails")
  if (freightLayer.getVisible()) layerIDs.push("freight")
  window.history.replaceState(
    {},
    "",
    `#@${x.toFixed(2)},${y.toFixed(2)},${zoom.toFixed(2)}z,${layerIDs.join(",")}`
  )
}

railsCheckbox.checked = true
groundCheckbox.checked = true
freightCheckbox.checked = false
if (!restoreState()) {
  saveState()
}
window.addEventListener("hashchange", e => {
  if (!restoreState()) {
    saveState()
  }
})

const onCheck = () => {
  updateLayers()
  saveState()
}

map.on("moveend", saveState)
railsCheckbox.addEventListener("change", e => onCheck())
groundCheckbox.addEventListener("change", e => onCheck())
freightCheckbox.addEventListener("change", e => onCheck())

map.on("postrender", () => {
  document.querySelector('footer').style.opacity = view.getZoom() < 3 ? 1 : 0
})

window.enableEditing = () => {
  document.body.addEventListener("click", e => {
    if (!e.shiftKey) return
    const pixel = [e.clientX, e.clientY]
    const name = prompt("name?")
    const point = map.getCoordinateFromPixel(pixel)

    const f = new Feature({
      geometry: new Point(point),
      name,
    })
    citiesSource.addFeature(f)
  })

  const modify = new Modify({
    hitDetection: citiesLayer,
    source: citiesSource,
  })
  modify.on(["modifystart", "modifyend"], function (evt) {
    target.style.cursor = evt.type === "modifystart" ? "grabbing" : "pointer"
  })
  const overlaySource = modify.getOverlay().getSource()
  overlaySource.on(["addfeature", "removefeature"], function (evt) {
    target.style.cursor = evt.type === "addfeature" ? "pointer" : ""
  })

  map.addInteraction(modify)

  setInterval(() => {
    localStorage.features = JSON.stringify(
      citiesSource.getFeatures().map(f => [f.getGeometry().getCoordinates(), f.get("name")])
    )
    console.log(localStorage.features)
  }, 1000)
}
