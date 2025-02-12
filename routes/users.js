const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// CRUD de usuários (passando o controle para o `userController`)
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
