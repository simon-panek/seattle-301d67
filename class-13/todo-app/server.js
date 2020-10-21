'use strict';

// pull in 3rd party dependencies
require('dotenv').config();

const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const app = express();

// setup server constants
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

// front end configuration - app.use() is considered express middleware
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // method override is the "hack" for put/delete req on the browser
app.set('view engine', 'ejs');

// database configuration
client.connect();
client.on('error', err => console.error(err));

// DB:    CREATE   READ   UPDATE   DELETE      maps as follow
// REST:  POST     GET    PUT      DELETE

// application routes - :req_param_name is a better tool than using query strings
app.get('/', getTasks); // this is our homepage route which will show all tasks -> rendering a page
app.get('/tasks/:task_id', getOneTask); // this is the individual tasks detail page route -> rendering a page
app.post('/add', addTask); // this is meant to handle our post request for a new tesk -> adding a task to the db
app.get('/add', showForm); // this will show the form to add a new task -> rendering a page

// NEW:  route to update task
app.put('/update/:task_id', updateTask);

// TODO:  create a route to delete a task

// EXAMPLE:
// app.delete('/delete/:task_id', deleteTask);
// function deleteTask(req, res) -> does DELETE operation on DB and routes back to home to see all tasks

// functions are "hoisted" to the top of the scope at runtime
function updateTask(req, res) {
  console.log(req.body);

  let { title, description, category, contact, status } = req.body;
  let SQL = `UPDATE tasks SET title=$1, description=$2, category=$3, contact=$4, status=$5 WHERE id=$6`;
  let values = [ title, description, category, contact, status, req.params.task_id ];

  console.log('updated req', values);

  client.query(SQL, values)
    .then(res.redirect(`/tasks/${req.params.task_id}`))
    .catch(err => console.error(err));
}

function getTasks(req, res) {
  let SQL = 'SELECT * FROM tasks;';

  return client.query(SQL)
    .then(results => {
      res.render('index', { results: results.rows })
    })
    .catch(err => handleError(err, res))
}

function getOneTask(req, res) {
  let SQL = 'SELECT * FROM tasks WHERE id=$1';
  let values = [req.params.task_id];

  return client.query(SQL, values)
    .then(result => {
      res.render('pages/detail-view', { task: result.rows[0] })
    })
    .catch(err => handleError(err, res))
}

function addTask(req, res) {
  console.log('req body - data from our form:', req.body);

  // destructuring - newer es6 construct
  let { title, description, category, contact, status } = req.body;

  let SQL = 'INSERT into tasks(title, description, category, contact, status) VALUES ($1, $2, $3, $4, $5);';
  let values = [ title, description, category, contact, status ];

  return client.query(SQL, values)
    .then(res.redirect('/'))
    .catch(err => handleError(err, res))
}

function showForm(req, res) {
  res.render('pages/add-view');
}

// refactor all "catch" blocks to use this error handler in the future
// this gives us more error handling control / modularity
function handleError(error, res) {
  res.render('pages/error-view', { error: 'generic server error' }) // this page needs to be built
}

// 404 catch all route
app.get('*', (req, res) => res.status(404).send('not found'));

// setup server to listen for incoming traffic
app.listen(PORT, () => {
  console.log(`server up: ${PORT}`)
});