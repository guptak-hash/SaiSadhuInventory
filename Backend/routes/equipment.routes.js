const express=require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { addEquipment, getEquipment } = require('../controllers/equipment.controllers');

const EquipmentRouter=express.Router();

// create/add equipment
EquipmentRouter.post('/add-equipment',authMiddleware('admin'),addEquipment);

// get all equipments
EquipmentRouter.get('/equipments',authMiddleware('user','admin'),getEquipment)

module.exports=EquipmentRouter