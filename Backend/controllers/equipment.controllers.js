const EquipmentModel = require("../models/equipment.model");

const addEquipment = async (req, res) => {
    try {
        const { name } = req.body;
        let equipment = await EquipmentModel.find({ name });
        if (equipment.length) return res.status(400).json({ msg: 'Euipment already exist' });
        equipment = await EquipmentModel.create(req.body);
        res.status(200).json({ msg: 'Equipment added success',equipment });
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

module.exports = { addEquipment }