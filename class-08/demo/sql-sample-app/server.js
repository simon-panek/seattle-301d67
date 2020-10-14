'use strict';

// 3rd party dependencies
require('dotenv').config();

const express = require('express');
const app = express();
const pg = require('pg');

// application constants
const PORT = process.env.PORT || 3000;
// setup a database connection string
const client = new pg.Client(process.env.DATABASE_URL);

// url: localhost:3333/add?first=brian&last=nations
app.get('/add', (req, res) => {
  let firstName = req.query.first;
  let lastName = req.query.last;

  // CRUD => this is a CREATE operation -> we are inserting a new record (creating) in the DB
  // INSERT INTO people -> lets add something to the people table
  // (first_name, last_name) VALUES ($1, $2) -> lets update first_name and last_name with real values
  // those values are going to be inserted into our actual query later (client.query)
  let SQL = 'INSERT INTO people (first_name, last_name) VALUES ($1, $2) RETURNING *;';
  let name = [firstName, lastName];

  client.query(SQL, name)
    .then( results => {
      res.status(200).json(results);
    })
    .catch(err => {
      console.error('db error:', err);
    })
});

// this route will retrieve a list of all items from our people table
app.get('/people', (req, res) => {
  // simple query to get everything from the people table
  let SQL = 'SELECT * FROM people';

  // here, we query the DB to get those people
  client.query(SQL)
    .then( results => {
      // if it worked, we've got an array with all the people
      res.status(200).json(results);
    })
    .catch( err => {
      // if it didn't work, tell us what happened (at the db level)
      console.error('db error:', err);
    })
});

// connect to our database
client.connect()
  .then( () => {
    // start the server if the db connection worked!
    app.listen(PORT, () => {
      console.log(`server up on: ${PORT}`);
    });
  })
  .catch( err => {
    console.error('connection error:', err);
  })