'use strict';

let name = 'brian';

function say(words) {
  let normalized = normalize(words);
  render(normalized);
}

function normalize(str) {
  return str.toUpperCase();
}

function render(something) {
  console.log(something);
}

say(name);