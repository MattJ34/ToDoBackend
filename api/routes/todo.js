const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo');

router.get('/', todoController.todo_get_all);

router.get('/:id', todoController.todo_get_by_id);

router.get('/byUser/:id', todoController.todo_get_by_userId);

router.post('/', todoController.todo_create);

router.patch('/:id', todoController.todo_update);

router.delete('/:id', todoController.todo_delete);

module.exports = router;