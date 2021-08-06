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

const groundOpacity = 0.5

const layers = {
  labels: new TileLayer({
    source: new XYZ({
      url: "./labels/{z}/{y}/{x}.png",
      minZoom: 0,
      maxZoom: 5,
      wrapX: false,
    }),
  }),

  ground: new TileLayer({
    source: new XYZ({
      url: "./ground/{z}/{y}/{x}.jpg",
      minZoom: 0,
      maxZoom: 5,
      // transition and opacity like to fight
      transition: 0,
      wrapX: false,
    }),
    opacity: groundOpacity,
  }),

  rails: new TileLayer({
    source: new XYZ({
      url: "./rails/{z}/{y}/{x}.png",
      minZoom: 0,
      maxZoom: 6,
      // We want transparency
      //transition: 0,
      wrapX: false,
    }),
  }),

  freight: new TileLayer({
    source: new XYZ({
      url: "./freight/{z}/{y}/{x}.png",
      minZoom: 0,
      maxZoom: 4,
      wrapX: false,
    }),
  }),

  hills: new TileLayer({
    source: new XYZ({
      url: "./hills/{z}/{y}/{x}.jpg",
      minZoom: 0,
      maxZoom: 4,
      // We want transparency
      transition: 0,
      wrapX: false,
    }),
    opacity: 0.4,
  }),
}

layers.ground.on('prerender', function(evt) {
  evt.context.fillStyle = '#00142d'
  //evt.context.fillStyle = '#04162c'
  evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height)
})

layers.hills.on('prerender', function(evt) {
  evt.context.globalCompositeOperation = "overlay"
})
layers.hills.on('postrender', function(evt) {
  evt.context.globalCompositeOperation = "source-over" // the default
})


const destinations = [
  [[-11509256.048274003,-4792688.738366079],"Shanklin"],[[-490012.3130970527,-4100115.5005955757],"Corby"],[[-2794106.2875826117,-1880138.6312788215],"Paignton"],[[-10144788.846995935,-916145.8109319322],"Elliotsburgh"],[[-5760217.333035581,-962707.2153230661],"Matlock"],[[-5463597.002579674,-4742097.9269354865],"Harrogate"],[[-2808952.8403542554,13615641.255143384],"Dorchester"],[[-1745710.8981249388,9928275.935007874],"Morecambe"],[[-1063020.831228012,6706756.77091109],"Stratford"],[[425145.5516069585,14546871.046588529],"Lowestoft"],[[2495246.740001009,7388736.773761578],"Ipswich"],[[4330976.6545172455,15191573.29868353],"Crowle"],[[11646436.67212716,-6043931.239985291],"Bodmin"],[[9499459.707118412,3616769.258477041],"Hendon"],[[15770342.367057431,2482151.8503076993],"Framlingham"],[[8720627.506690647,-3290608.3436778146],"Kingston"],[[8112421.699137073,-7487879.54570882],"BRADSHAW"],[[2675927.5885796696,12245193.102547621],"Melksham"],[[7939238.78343342,10489194.59531007],"Hartlepool"],[[4828881.910187664,9214617.52819717],"Wakefield"],[[9165438.556871613,6802442.19696762],"Haverhill"],[[12129719.483496044,8382194.510402279],"Bury"],[[2852497.9188333834,-6724550.263093776],"Guisborough"],[[2852867.672892156,-3548137.441230545],"Bridport"],[[4844296.682017058,-1472153.6194650547],"Stamford"],[[5517585.55144822,-4472461.45535468],"Richmond"],[[2103096.0023485394,1115224.8096935754],"Maghull"],[[4928957.415177724,4434110.874124361],"Rugeley"],[[6354493.2440395225,1199665.1981726745],"Ashbourne"],[[2636385.37519719,-10395975.248173911],"Ely"],[[9981109.92988392,-9091906.309091015],"Shildon"],[[14430819.092168609,-8816933.605996683],"Liverpool"],[[17527219.85833634,-10255573.806566413],"Ellesmere"],[[11849604.605943765,-15167908.887902051],"Mayburgh"],[[9213155.330673117,-15740793.869832855],"London"],[[9708366.014632285,-11944283.678644933],"Finsbury"],[[7381249.922769944,-10068209.625334239],"Market Harbourough"],[[-5017968.576765825,15365540.190808048],"Hexham"],[[-10733244.366263656,11650258.228636468],"Rayleigh"],[[-10859494.900552345,16381747.908406558],"Frome"],[[-6885946.520778631,11068462.573429814],"Chesterfield"],[[-15152304.980342142,-54274.85515439627],"Southport"],[[-17407418.874577414,2638719.019780983],"Bristol"],[[-13945657.818793025,3107364.6616410445],"Stevenage"],[[-16959777.54612035,6322029.96539974],"Orpington"],[[-10968220.04609807,3001190.751433737],"Blackpool"],[[-11402151.769343752,6778492.4806149425],"Shepshed"],[[-7217836.546928883,4259618.786482067],"Wooler"],[[-2708823.1912926775,-11400778.824205598],"Droitwich Spa"],[[-8930601.898182154,-10893904.69386308],"Leyton"],[[-11420355.303179754,-8643012.786193624],"Flitwick"],[[-2988833.398123209,-7862879.238051959],"Knottingley"]
]
destinations.sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? +1 : 0)

const featureScale = 112000

const features = destinations.map(
  ([[x, y], name]) =>
    new Feature({
      geometry: new Point([x, y]),
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
layers.cities = new VectorLayer({
  source: citiesSource,
  style: feature => {
    labelStyle.getText().setText(feature.get("name"))
    return [fillStyle, labelStyle]
  },
  declutter: true,
  visible: false,
})

const menu = document.getElementById("menu")
const toggleMenuButton = document.getElementById("toggle-menu")
toggleMenuButton.addEventListener('click', e => {
  e.preventDefault()
  menu.classList.toggle('visible')
})

const dropdown = document.getElementById("dropdown")
const checkboxes = {
  labels: document.getElementById("labels"),
  rails: document.getElementById("rails"),
  ground: document.getElementById("ground"),
  freight: document.getElementById("freight"),
  hills: document.getElementById("hills"),
}

for (let [[x, y], name] of destinations) {
  const option = document.createElement("option")
  option.textContent = name
  option.value = `${x},${y}`
  dropdown.appendChild(option)
}

dropdown.addEventListener("change", e => {
  const [x, y] = dropdown.value.split(",")
  view.setZoom(5.25)
  const size = map.getSize()
  const [width, height] = size
  view.centerOn([x, y], size, [width / 2, height / 2])
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
  layers: [layers.ground, layers.freight, layers.rails, layers.hills, layers.labels, layers.cities],
  view,
})

const updateLayers = () => {
  layers.rails.setVisible(checkboxes.rails.checked)
  layers.ground.setVisible(checkboxes.ground.checked)
  layers.freight.setVisible(checkboxes.freight.checked)
  layers.labels.setVisible(checkboxes.labels.checked)
  layers.hills.setVisible(checkboxes.hills.checked)
  layers.ground.setOpacity(checkboxes.rails.checked || checkboxes.freight.checked ? groundOpacity : 1)
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
  checkboxes.rails.checked = layers.find(x => x == "rails")
  checkboxes.ground.checked = layers.find(x => x == "ground")
  checkboxes.freight.checked = layers.find(x => x == "freight")
  checkboxes.labels.checked = layers.find(x => x == "labels")
  checkboxes.hills.checked = layers.find(x => x == "hills")
  updateLayers()
  return true
}

const saveState = () => {
  const center = view.getCenter()
  const zoom = view.getZoom()
  const x = center[0] / featureScale
  const y = center[1] / featureScale
  const layerIDs = []
  if (layers.ground.getVisible()) layerIDs.push("ground")
  if (layers.rails.getVisible()) layerIDs.push("rails")
  if (layers.freight.getVisible()) layerIDs.push("freight")
  if (layers.labels.getVisible()) layerIDs.push("labels")
  if (layers.hills.getVisible()) layerIDs.push("hills")
  window.history.replaceState(
    {},
    "",
    `#@${x.toFixed(2)},${y.toFixed(2)},${zoom.toFixed(2)}z,${layerIDs.join(",")}`
  )
}

checkboxes.rails.checked = true
checkboxes.hills.checked = true
checkboxes.labels.checked = true

checkboxes.freight.checked = false
checkboxes.ground.checked = false

layers.freight.setVisible(false)
layers.ground.setVisible(false)

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
checkboxes.rails.addEventListener("change", e => onCheck())
checkboxes.ground.addEventListener("change", e => onCheck())
checkboxes.freight.addEventListener("change", e => onCheck())
checkboxes.hills.addEventListener("change", e => onCheck())
checkboxes.labels.addEventListener("change", e => onCheck())

map.on("postrender", () => {
  document.querySelector('footer').style.opacity = view.getZoom() < 3 ? 1 : 0
})
window.ol = map

window.enableEditing = () => {
  layers.cities.setVisible(true)
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
    hitDetection: layers.cities,
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
