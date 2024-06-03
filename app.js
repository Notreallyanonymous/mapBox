    const express = require('express');
    const dotenv = require('dotenv');
    const bodyParser = require('body-parser');
    const fs = require('fs'); // Módulo para manejar archivos
    const geocode = require('./geocode');
    const getRoute = require('./directions');

    dotenv.config();

    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.static('public'));
    app.use(bodyParser.json());

    let vehicles = [];

    // Ruta para obtener el token de Mapbox
    app.get('/config', (req, res) => {
    res.send({ mapboxToken: process.env.MAPBOX_TOKEN });
    });

    // Ruta para registrar un nuevo vehículo
    app.post('/vehicles', async (req, res) => {
    const { id, status, pointAAddress, pointBAddress, fuelLevel, avgSpeed, totalKm } = req.body;
    try {
        const pointA = await geocode(pointAAddress);
        const pointB = await geocode(pointBAddress);
        const {route, steps} = await getRoute(pointA, pointB);
        const vehicle = { id, status, pointA, pointB,route, steps,  performance: { fuelLevel, avgSpeed, totalKm } };
        vehicles.push(vehicle);
        // Guardar los vehículos en la base de datos
        saveData(vehicles);
        res.send({ message: 'Vehículo registrado con éxito', vehicle });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
    });

    // Ruta para obtener la información completa de la flota
    app.get('/vehicles', (req, res) => {
    // Cargar los vehículos desde la base de datos
    loadData((data) => {
        vehicles = data;
        res.send(vehicles);
    });
    });

    // Ruta para ver el contenido de database.json
    app.get('/database', (req, res) => {
    // Cargar los datos de database.json
    loadData((data) => {
        res.send(data);
    });
    });

      // Ruta para ver el contenido de database.json
      app.delete('/database', (req, res) => {
        vehicles = []; // Clear the vehicles array
        saveData(vehicles); // Save the empty array to the database file
        res.send({ message: "Se borro la base de datos" });
        });

    // Función para guardar datos en la base de datos
    const saveData = (data) => {
    const jsonData = JSON.stringify(data);
    fs.writeFileSync('database.json', jsonData);
    };

    // Función para cargar datos desde la base de datos
    const loadData = (callback) => {
    fs.readFile('database.json', (err, data) => {
        if (err) {
        callback([]);
        } else {
        const jsonData = JSON.parse(data);
        callback(jsonData);
        }
    });
    };

    app.listen(port, () => {
    console.log(`Servidor está ejecutándose en el puerto ${port}`);
    });