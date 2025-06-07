const EquipmentModel = require("../models/equipment.model");
const LeaseModel = require("../models/lease.model");

const createLease =async (req, res) => {
  try {
    req.body.tool = req.params.toolId;
    req.body.user = req.user.userId;
//   console.log('toolId >> ',req.params.toolId,'userId>> ',req.user.userId)
    const tool = await EquipmentModel.findById(req.params.toolId);

    if (!tool) {
       return  res.status(400).json({msg: `No tool with the id of ${req.params.toolId}`})
    }

    // Check if tool is available
    // available qty should be greater than rqd. by user 
    // that check is needed here
    if (tool.quantityAvailable <= 0) {
         return  res.status(400).json({msg: `Tool ${tool.name} is currently not available`})
    }

    // Check if dates are valid
    if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
          return  res.status(400).json({msg: `End date must be after start date`})
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
         return  res.status(400).json({msg: `Tool is already leased for the selected period`})
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

const getLeases=async (req, res) => {
  try {
    let query;

    if (req.params.toolId) {
      query = LeaseModel.find({ tool: req.params.toolId });
    } else if (req.user.role === 'user') {
      query = LeaseModel.find({ user: req.user.id });
    } else {
      query = LeaseModel.find().populate({
        path: 'tool',
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

module.exports={getLeases,createLease}