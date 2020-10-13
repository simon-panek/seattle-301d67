'use strict';

// pulling in 3rd party dependencies (npm packages)
require('dotenv').config();
const superagent = require('superagent');
const express = require('express');
const cors = require('cors');

// application constants
const app = express();
const PORT = process.env.PORT;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

// middleware method that allows open access to our API
app.use(cors());

// simple test route, which returns a homepage
app.get('/', (request, response) => {
  response.send('my homepage');
});

// a route to demonstrate the throwing of an error
app.get('/unauthorized', (request, response) => {
  throw new Error('not authorized to access this route');
});

// our first "kinda real" API route -> we can use the response object to power our frontends or APIs
app.get('/test/route', (request, response) => {
  // data I made - not dynamic, doesn't change
  response.json({ location: 'seattle', temp: '58 deg' });
});

// this route doesn't have an anon callback, we just named it below
app.get('/location', handleLocation);

// example MAPBOX API url:  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;
// example ZOMATO API url:  const url = 'https://developers.zomato.com/api/v2.1/geocode?latitude=${lat}&longitude=${lon}';
// app.get('/restaraunts', handleRest); // ZOMATO API
// app.get('/places', handlePlaces); // MAPBOX API

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

// IMPORTANT: this is the main lecture component -> pulling data from an external resource
// vs pulling data from our own (such as a file that lives in our app)
function handleLocation(request, response) {
  try {
    // pulls in a sample json file
    const geoData = require('./data/location.json');
    const city = request.query.city; // "seattle" -> localhost:3000/location?city=seattle

    const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
    
    superagent.get(url)
      .then(data => {
        const geoData = data.body[0];
        const locationData = new Location(city, geoData);
        // locationData[url] = locationData;
        console.log(locationData);
        response.json(locationData);
      })
      .catch(err => console.error('returned error:', err));

  } catch {
    response.status(500).send('sorry, something broke.');
  }
}

superagent.get(`https://developers.zomato.com/api/v2.1/categories`)
.set('user-key', ZOMATO_API_KEY)
.then(data => console.log(data));


// 404 - catch all route
app.get('*', (request, response) => {
  response.status(404).send('not found');
});

// sets up our server for incoming network traffic
app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});