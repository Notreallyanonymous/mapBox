var mapa;
// Declara la variable mapa fuera de la función DOMContentLoaded
mapboxgl.accessToken = 'pk.eyJ1Ijoid2lsbGl3b25rYSIsImEiOiJjbHdyYnVhMDIwOGd5MmlvZ3lsZnRsbTg0In0.bSSPmW9wZJj0mqVX6z3Wsg';

let map = new mapboxgl.Map({
  container: 'mapa',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-88.89653, 13.794185], // Coordenadas del centro de El Salvador
  zoom: 12
});

var counter;
var searchData = {};
var markers = []; // Array to keep track of markers

async function registrarVehiculo() {
  await fetch('http://localhost:3000/database')
    .then(response => response.json())
    .then(data => {
      data = data.filter((x) => x.id !== '');
      counter = data.length;
      searchData = data;
      console.log(searchData);
    });

  let id = document.getElementById('id-vehiculo').value;
  let match = searchData.some(vehicle => vehicle.id == id);
  console.log(id);
  console.log(match);
  if (counter < 5 && match === false) {
    const id = document.getElementById('id-vehiculo').value;
    const status = document.getElementById('status').value;
    const pointAAddress = document.getElementById('pointA-address').value;
    const pointBAddress = document.getElementById('pointB-address').value;
    const fuelLevel = document.getElementById('fuel-level').value;
    const avgSpeed = document.getElementById('avg-speed').value;
    const totalKm = document.getElementById('total-km').value;

    try {
      const response = await axios.post('/vehicles', {
        id, status, pointAAddress, pointBAddress, fuelLevel, avgSpeed, totalKm
      });

      const { vehicle } = response.data;
      mostrarRuta(vehicle);
    } catch (error) {
      console.error('Error registrando vehículo:', error);
    }
  } else {
    Swal.fire({
      title: "No se puede ingresar mas de 5 rutas o una ruta con el mismo Id",
      width: 600,
      padding: "3em",
      color: "#716add",
      background: "#fff url(/images/trees.png)",
      backdrop: `
        rgba(0,0,123,0.4)     
        url("https://media0.giphy.com/media/sIIhZliB2McAo/200w.gif?cid=6c09b952rq90tc5se245ve6r14e3gcfqa0egoijis293d8jr&ep=v1_gifs_search&rid=200w.gif&ct=g")
        left top
        no-repeat
      `
    });
  }
}

function mostrarRuta(vehicle) {
  const { route, steps, pointA, pointB } = vehicle;

  const routeId = `route-${vehicle.id}`;

  // Remove existing route layer and source if they exist
  if (map.getLayer(routeId)) {
    map.removeLayer(routeId);
  }
  if (map.getSource(routeId)) {
    map.removeSource(routeId);
  }

  // Remove existing markers
  markers.forEach(marker => marker.remove());
  markers = []; // Clear the array

  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route.coordinates
    }
  };

  map.addSource(routeId, {
    type: 'geojson',
    data: geojson
  });

  map.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': 5,
      'line-opacity': 0.75
    }
  });

  const midpoint = {
    latitude: (pointA.latitude + pointB.latitude) / 2,
    longitude: (pointA.longitude + pointB.longitude) / 2
  };

  function distance() {
    const a = pointA.longitude - pointB.longitude;
    const b = pointA.latitude - pointB.latitude;
    const c = Math.sqrt(a * a + b * b);
    return c;
  }

  console.log(distance());

  if (distance() > 1) {
    map.flyTo({
      center: [midpoint.longitude, midpoint.latitude],
      zoom: 5
    });
  } else {
    map.flyTo({
      center: [midpoint.longitude, midpoint.latitude],
      zoom: 7
    });
  }

  const markerA = new mapboxgl.Marker()
    .setLngLat([pointA.longitude, pointA.latitude])
    .addTo(map);
  markers.push(markerA);

  const markerB = new mapboxgl.Marker({ color: 'red' })
    .setLngLat([pointB.longitude, pointB.latitude])
    .addTo(map);
  markers.push(markerB);
}

function abrirRutas() {
  window.open('rutas_guardadas.html', '_blank');
}

function reiniciarRutas() {
  const allLayers = map.getStyle().layers;
  allLayers.forEach((layer) => {
    if (layer.id.startsWith('route-')) {
      map.removeLayer(layer.id);
    }
  });

  const allSources = map.getStyle().sources;
  Object.keys(allSources).forEach((sourceId) => {
    if (sourceId.startsWith('route-')) {
      map.removeSource(sourceId);
    }
  });

  document.getElementById('instructions').innerHTML = '';
  // Remove all markers
  markers.forEach(marker => marker.remove());
  markers = []; // Clear the array
}

async function actualizarVehiculo() {
  const id = document.getElementById('id-vehiculo').value;
  const status = document.getElementById('status').value;
  const pointAAddress = document.getElementById('pointA-address').value;
  const pointBAddress = document.getElementById('pointB-address').value;
  const fuelLevel = document.getElementById('fuel-level').value;
  const avgSpeed = document.getElementById('avg-speed').value;
  const totalKm = document.getElementById('total-km').value;

  try {
    const response = await axios.put(`/vehicles/${id}`, {
      status, pointAAddress, pointBAddress, fuelLevel, avgSpeed, totalKm
    });

    const { vehicle } = response.data;
    mostrarRuta(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
  }
}
