const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a tool name']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'power-tools',
      'hand-tools',
      'heavy-machinery',
      'measuring-tools',
      'safety-equipment'
    ]
  },
  dailyLeasePrice: {
    type: Number,
    required: [true, 'Please add a daily lease price']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Please add a purchase price']
  },
  quantityAvailable: {
    type: Number,
    required: [true, 'Please add quantity available'],
    min: 0
  },
  condition: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const EquipmentModel=mongoose.model('eqipment', equipmentSchema);

module.exports = EquipmentModel;