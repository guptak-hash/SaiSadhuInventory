const express=require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { addEquipment } = require('../controllers/equipment.controllers');

const EquipmentRouter=express.Router();

EquipmentRouter.post('/add-equipment',authMiddleware('admin'),addEquipment)

module.exports=EquipmentRouter