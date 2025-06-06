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

module.exports = { addEquipment,getEquipment}