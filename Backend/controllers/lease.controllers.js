const EquipmentModel = require("../models/equipment.model");
const LeaseModel = require("../models/lease.model");

const createLease = async (req, res) => {
    try {
        req.body.tool = req.params.toolId;
        req.body.user = req.user.userId;
        //   console.log('toolId >> ',req.params.toolId,'userId>> ',req.user.userId)
        const tool = await EquipmentModel.findById(req.params.toolId);

        if (!tool) {
            return res.status(400).json({ msg: `No tool with the id of ${req.params.toolId}` })
        }

        // Check if tool is available
        // available qty should be greater than rqd. by user 
        // that check is needed here
        if (tool.quantityAvailable <= 0) {
            return res.status(400).json({ msg: `Tool ${tool.name} is currently not available` })
        }

        // Check if dates are valid
        if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
            return res.status(400).json({ msg: `End date must be after start date` })
        }

        // Check if tool is already leased for the same period
        // by same user check needed
        const existingLeases = await LeaseModel.find({
            tool: req.params.toolId,
            $or: [
                {
                    startDate: { $lte: new Date(req.body.endDate) },
                    endDate: { $gte: new Date(req.body.startDate) }
                }
            ],
            status: { $in: ['pending', 'active'] }
        });

        if (existingLeases.length > 0) {
            return res.status(400).json({ msg: `Tool is already leased for the selected period` })
        }

        // Set delivery charge from tool
        req.body.deliveryCharge = tool.deliveryCharge;
        req.body.conditionBefore = tool.condition;

        const lease = await LeaseModel.create(req.body);

        // Reduce tool quantity by 1
        // user can lease more than one tool of same kind 
        tool.quantityAvailable -= 1;
        await tool.save();

        res.status(201).json({
            success: true,
            data: lease
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};

const getLeases = async (req, res) => {
    try {
        let query;

        if (req.params.toolId) {
            query = LeaseModel.find({ tool: req.params.toolId });
        } else if (req.user.role === 'user') {
            query = LeaseModel.find({ user: req.user.userId });
        } else {
            query = LeaseModel.find().populate({
                path: 'eqipment',
                select: 'name description'
            });
        }

        const leases = await query;

        res.status(200).json({
            success: true,
            count: leases.length,
            data: leases
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};

// @route   PUT /api/leases/:id
const updateLease = async (req, res) => {
  try {
    let lease = await LeaseModel.findById(req.params.id);
    if (!lease) {
      return res.status(404).json({ msg: 'Lease not found' });
    }

    // Authorization check
    if (
      lease.user.toString() !== req.user.userId &&
      req.user.role !== 'admin' &&
      req.user.role !== 'manager'
    ) {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }

    // Status validation
    if (
      lease.status !== 'pending' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'manager'
    ) {
      return res.status(400).json({ msg: 'Only pending leases can be updated' });
    }

    // Handle quantity changes
    if (req.body.quantity && req.body.quantity !== lease.quantity) {
      const equipment = await EquipmentModel.findById(lease.tool);
      const quantityDifference = req.body.quantity - lease.quantity;
      
      if (equipment.quantityAvailable < quantityDifference) {
        return res.status(400).json({
          msg: `Not enough inventory. Only ${equipment.quantityAvailable} available`
        });
      }

      // Update inventory first
      equipment.quantityAvailable -= quantityDifference;
      await equipment.save();
    }

    // Date validation and price calculation
    if (req.body.startDate || req.body.endDate) {
      const startDate = req.body.startDate || lease.startDate;
      const endDate = req.body.endDate || lease.endDate;

      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ msg: 'End date must be after start date' });
      }

      const tool = await EquipmentModel.findById(lease.tool);
      const diffDays = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
      req.body.totalPrice = (diffDays * tool.dailyLeasePrice * (req.body.quantity || lease.quantity)) 
                          + (req.body.deliveryCharge || lease.deliveryCharge);
    }

    // Apply updates
    lease = await LeaseModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: lease
    });

  } catch (err) {
    console.error('Lease update error:', err);

    if (err.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid ID format' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Validation failed',
        errors: err.errors 
      });
    }

    res.status(500).json({ 
      msg: 'Lease update failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


// @desc    Cancel lease
// @route   PUT /api/leases/:id/cancel
// @access  Private
const cancelLease = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id);

    if (!lease) {
      return res.status(404).json({ msg: `Lease not found with id of ${req.params.id}` });
    }

    // Authorization check
    if (
      lease.user.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'manager'
    ) {
      return res.status(403).json({  // Changed from 404 to 403 (Forbidden)
        msg: `User ${req.user.id} is not authorized to cancel this lease`
      });
    }

    // Status validation
    if (
      lease.status !== 'pending' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'manager'
    ) {
      return res.status(400).json({  // Changed from 404 to 400 (Bad Request)
        msg: `Only pending leases can be cancelled by users`
      });
    }

    // Don't allow cancelling already cancelled leases
    if (lease.status === 'cancelled') {
      return res.status(400).json({
        msg: 'Lease is already cancelled'
      });
    }

    // Update lease status
    lease.status = 'cancelled';
    await lease.save();

    // Increase tool quantity by leased amount (using atomic operation)
    await EquipmentModel.findByIdAndUpdate(
      lease.tool,
      { $inc: { quantityAvailable: lease.quantity } },  // Changed from +=1 to use leased quantity
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: lease
    });

  } catch (err) {
    console.error('Cancel lease error:', err);
    
    // More specific error handling
    if (err.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid lease ID format' });
    }
    
    res.status(500).json({ 
      msg: 'Lease cancellation failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


module.exports = { getLeases, createLease,updateLease,cancelLease}