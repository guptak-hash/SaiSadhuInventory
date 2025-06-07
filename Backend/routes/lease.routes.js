const express=require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createLease, getLeases } = require('../controllers/lease.controllers');

const LeaseRouter=express.Router();

//  Create new lease
LeaseRouter.post('/tools/:toolId/leases',authMiddleware('user'),createLease)

// get all leases
// LeaseRouter.get('/tools/:toolId/leases',authMiddleware('user','admin'),getLeases);

LeaseRouter.get('/tools/:toolId/leases', authMiddleware('user', 'admin'), getLeases);
LeaseRouter.get('/leases', authMiddleware('user', 'admin'), getLeases);

module.exports=LeaseRouter