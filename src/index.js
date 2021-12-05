const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({
      error: "User not found.",
    });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  // TODO: check if name and username have value

  const checkIfUserExists = users.some((user) => user.username === username);
  if (checkIfUserExists) {
    return response.status(400).json({
      error: "User already exists.",
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  if (title === "" || !title) {
    return response.status(400).json({
      error: "Title is required.",
    });
  }

  if (deadline === "" || !deadline) {
    return response.status(400).json({
      error: "Deadline is required.",
    });
  }

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "ToDo not found.",
    });
  }

  if (title === "" || deadline === "") {
    return response.status(400).json({
      error: "Title and/or Deadline cannot be blank.",
    });
  }

  todo.title = title ? title : todo.title;
  todo.deadline = deadline ? new Date(deadline) : todo.deadline;
  todo.updated_at = new Date();

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({
      error: "Todo not found.",
    });
  }

  todo.done = true;
  todo.updated_at = new Date();

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({
      error: "Todo not found.",
    });
  }

  const index = user.todos.indexOf(todo);
  user.todos.splice(index, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
