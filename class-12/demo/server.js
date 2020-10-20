'use strict';

// pull in 3rd party dependencies
require('dotenv').config();

const express = require('express');
const pg = require('pg');
const app = express();

// setup server constants
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

// front end configuration
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// database configuration
client.connect();
client.on('error', err => console.error(err));

// DB:    CREATE   READ   UPDATE   DELETE      maps as follow
// REST:  POST     GET    PUT      DELETE

// application routes - :req_param_name is a better tool than using query strings
app.get('/', getTasks);
app.get('/tasks/:task_id', getOneTask); // this uses req.params -> req.param.task_id
app.post('/add', addTask);
app.get('/add', showForm);

// functions are "hoisted" to the top of the scope at runtime
function getTasks(req, res) {
  let SQL = 'SELECT * FROM tasks;';

  return client.query(SQL)
    .then(results => {
      res.render('index', { results: results.rows })
    })
    .catch(err => console.error(err));
}

function getOneTask(req, res) {
  let SQL = 'SELECT * FROM tasks WHERE id=$1';
  let values = [req.params.task_id];

  return client.query(SQL, values)
    .then(result => {
      res.render('pages/detail-view', { task: result.rows[0] })
    })
    .catch(err => console.error(err));
}

function addTask(req, res) {
  console.log('req body - data from our form:', req.body);

  // destructuring - newer es6 construct
  let { title, description, category, contact, status } = req.body;

  let SQL = 'INSERT into tasks(title, description, category, contact, status) VALUES ($1, $2, $3, $4, $5);';
  let values = [ title, description, category, contact, status ];

  return client.query(SQL, values)
    .then(res.redirect('/'))
    .catch(err => console.error(err))
}

function showForm(req, res) {
  res.render('pages/add-view');
}

// 404 catch all route
app.get('*', (req, res) => res.status(404).send('not found'));

// setup server to listen for incoming traffic
app.listen(PORT, () => {
  console.log(`server up: ${PORT}`)
});