const express=require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { addEquipment, getEquipment, getEquipmentById, updateEquipment, deleteEquipment } = require('../controllers/equipment.controllers');

const EquipmentRouter=express.Router();

// create/add equipment
EquipmentRouter.post('/add-equipment',authMiddleware('admin'),addEquipment);

// get all equipments
EquipmentRouter.get('/equipments',authMiddleware('user','admin'),getEquipment)

// get equipment by id
EquipmentRouter.get('/equipment/:id',authMiddleware('user','admin'),getEquipmentById)

// update equipment
EquipmentRouter.patch('/equipment/:id',authMiddleware('admin'),updateEquipment);

// delete equipment
EquipmentRouter.delete('/equipment/:id',authMiddleware('admin'),deleteEquipment)

module.exports=EquipmentRouter