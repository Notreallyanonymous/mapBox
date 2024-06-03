const axios = require('axios');

const getRoute = async (start, end) => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&access_token=${process.env.MAPBOX_TOKEN}`;

  try {
    const response = await axios.get(url);
    const route = response.data.routes[0].geometry;
    const steps =  response.data.routes[0].legs[0].steps;
    return {route, steps};
  } catch (error) {
    throw new Error('No se puede conectar con el servicio de direcciones');
  }
};

module.exports = getRoute;