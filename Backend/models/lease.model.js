const mongoose = require('mongoose');

const LeaseSchema = new mongoose.Schema({
  tool: {
    type: mongoose.Schema.ObjectId,
    ref: 'eqipment',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  leaseType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'damaged'],
    default: 'pending'
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Please add a delivery address']
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please add a total price']
  },
  conditionBefore: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  conditionAfter: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'poor', 'damaged'],
    default: 'good'
  },
  damageCharges: {
    type: Number,
    default: 0
  },
  purchaseOptionSelected: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


// Add a pre-validate hook
LeaseSchema.pre('validate', async function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
    const tool = await this.model('eqipment').findById(this.tool);
    const diffDays = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    this.totalPrice = (diffDays * tool.dailyLeasePrice) + this.deliveryCharge;
  }
  next();
});

// Calculate total price before saving
LeaseSchema.pre('save', async function(next) {
  if (!this.isModified('startDate') && !this.isModified('endDate')) {
    return next();
  }

  const tool = await this.model('eqipment').findById(this.tool);
  
  // Calculate days between start and end date
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  this.totalPrice = (diffDays * tool.dailyLeasePrice) + this.deliveryCharge;
  
  next();
});

const LeaseModel=mongoose.model('lease', LeaseSchema);

module.exports = LeaseModel