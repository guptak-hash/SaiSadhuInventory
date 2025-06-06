const EquipmentModel = require("../models/equipment.model");

const addEquipment = async (req, res) => {
    try {
        const equipmentData = Array.isArray(req.body) ? req.body : [req.body];

        // Get all names from the input
        const names = equipmentData.map(item => item.name);

        // Check for existing equipment with these names
        const existingEquipment = await EquipmentModel.find({
            name: { $in: names }
        });

        // Filter out duplicates
        const existingNames = existingEquipment.map(item => item.name);
        const newEquipmentData = equipmentData.filter(
            item => !existingNames.includes(item.name)
        );

        if (newEquipmentData.length === 0) {
            return res.status(400).json({
                msg: 'All equipment already exists',
                duplicates: existingNames
            });
        }

        // Insert only non-duplicates
        const insertedEquipment = await EquipmentModel.insertMany(newEquipmentData);

        res.status(200).json({
            msg: `Added ${insertedEquipment.length} equipment successfully`,
            added: insertedEquipment,
            duplicates: existingNames.length > 0 ? existingNames : undefined
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Something went wrong' });
    }
}

const getEquipment = async (req, res) => {
    try {
        let equipments = await EquipmentModel.find();
        // console.log('equipments>> ',equipments)
        if (!equipments.length) return res.status(400).json({ msg: 'No equipment found' });
        res.status(200).json({ msg: 'Equipments!', equipments })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Something went wrong' });
    }
}

const getEquipmentById=async (req, res) => {
  try {
    const tool = await EquipmentModel.findById(req.params.id);

    if (!tool) {
      return res.status(400).json({msg:`Tool not found with id of ${req.params.id}`})
    }

    res.status(200).json({
      success: true,
      data: tool
    });
  } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};


const updateEquipment=async (req, res) => {
  try {
    const tool = await EquipmentModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!tool) {
      return res.status(400).json({msg:`Tool not found with id of ${req.params.id}`})
    }

    res.status(200).json({
      success: true,
      data: tool
    });
  } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};


const deleteEquipment=async (req, res) => {
  try {
    const tool = await EquipmentModel.findById(req.params.id);

    if (!tool) {
       return res.status(400).json({msg:`Tool not found with id of ${req.params.id}`})
    }

    // Check if tool is currently leased
    // const activeLeases = await Lease.find({
    //   tool: req.params.id,
    //   status: { $in: ['pending', 'active'] }
    // });

    // if (activeLeases.length > 0) {
    //      return res.status(400).json({msg:`Cannot delete tool as it is currently leased or pending lease`})
    // }

     const deletedTool = await EquipmentModel.findByIdAndDelete(req.params.id);

    if (!deletedTool) {
      return res.status(404).json({ msg: 'Tool not found' });
    }

    res.status(200).json({
      success: true,
      msg: 'Tool deleted successfully',
      data: deletedTool  // This will contain the deleted document
    });
  } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};

module.exports = { addEquipment,getEquipment,getEquipmentById,updateEquipment,deleteEquipment}