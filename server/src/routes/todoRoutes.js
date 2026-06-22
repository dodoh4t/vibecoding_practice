const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const todosRepository = require('../repositories/todosRepository');
const { validationError, todoNotFound } = require('../errors');
const { formatTodo } = require('../utils/formatters');
const { isPositiveIntegerId, parseBooleanQuery } = require('../utils/validators');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const completed = parseBooleanQuery(req.query.completed);
  const sort = req.query.sort || 'createdAtDesc';

  if (completed === null) {
    throw validationError('completed must be a boolean value.');
  }

  if (!['createdAtDesc', 'createdAtAsc'].includes(sort)) {
    throw validationError('sort must be one of createdAtDesc or createdAtAsc.');
  }

  const todos = await todosRepository.listTodos({
    userId: req.user.id,
    completed,
    sort
  });

  return res.status(200).json({
    todos: todos.map(formatTodo)
  });
}));

router.post('/', asyncHandler(async (req, res) => {
  const content = typeof req.body.content === 'string'
    ? req.body.content.trim()
    : '';

  if (!content) {
    throw validationError('Todo content must not be empty.');
  }

  const todo = await todosRepository.createTodo({
    userId: req.user.id,
    content
  });

  return res.status(201).json({ todo: formatTodo(todo) });
}));

router.patch('/:todoId', asyncHandler(async (req, res) => {
  const { todoId } = req.params;

  if (!isPositiveIntegerId(todoId)) {
    throw validationError('todoId must be a valid positive integer.');
  }

  if (typeof req.body.isCompleted !== 'boolean') {
    throw validationError('isCompleted is required.');
  }

  const todo = await todosRepository.updateTodoCompletion({
    todoId,
    userId: req.user.id,
    isCompleted: req.body.isCompleted
  });

  if (!todo) {
    throw todoNotFound();
  }

  return res.status(200).json({ todo: formatTodo(todo) });
}));

router.delete('/:todoId', asyncHandler(async (req, res) => {
  const { todoId } = req.params;

  if (!isPositiveIntegerId(todoId)) {
    throw validationError('todoId must be a valid positive integer.');
  }

  const deleted = await todosRepository.deleteTodo({
    todoId,
    userId: req.user.id
  });

  if (!deleted) {
    throw todoNotFound();
  }

  return res.status(204).send();
}));

module.exports = router;
