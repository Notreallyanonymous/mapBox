const axios = require('axios');

const geocode = async (address) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.MAPBOX_TOKEN}`;

  try {
    const response = await axios.get(url);
    if (response.data.features.length === 0) {
      throw new Error('Location not found');
    }
    const [longitude, latitude] = response.data.features[0].geometry.coordinates;
    return { latitude, longitude };
  } catch (error) {
    throw new Error('Error al conectar con el servicio de geocodificación');
  }
};

module.exports = geocode;