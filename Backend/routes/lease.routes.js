const express=require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createLease } = require('../controllers/lease.controllers');

const LeaseRouter=express.Router();

//  Create new lease
LeaseRouter.post('/tools/:toolId/leases',authMiddleware('user'),createLease)

module.exports=LeaseRouter