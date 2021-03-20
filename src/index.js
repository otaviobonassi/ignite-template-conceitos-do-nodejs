const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( user => user.username === username );
  if(!user) {
    return response.status(404).json({error:"User not found"});
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const hasUser = users.find( user => user.username === username );
  if(hasUser) return response.status(400).json({error: "User already registered"});

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todoWithId = user.todos.find((todo) => String(todo.id) === String(id));
  if(!todoWithId) {
    return response.status(404).json({error: "ToDo not found"});
  }

  todoWithId.title = title;
  todoWithId.deadline = new Date(deadline);
  return response.status(200).json(todoWithId);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoWithId = user.todos.find((todo) => String(todo.id) === String(id));
  if(!todoWithId) {
    return response.status(404).json({error: "ToDo not found"});
  }

  todoWithId.done = true;
  
  return response.status(200).json(todoWithId);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const index = user.todos.findIndex((todo) => todo.id === id);
  if(index === -1) return response.status(404).json({error: "ToDo not found"});

  user.todos.splice(index, 1);

  return response.sendStatus(204);
});

module.exports = app;