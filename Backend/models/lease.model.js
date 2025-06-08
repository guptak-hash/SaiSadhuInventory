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
   quantity: {
    type: Number,
    required: [true, 'Please specify quantity'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
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


LeaseSchema.pre('validate', async function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate') || this.isModified('quantity')) {
    const tool = await this.model('eqipment').findById(this.tool);
    // if (!tool) {
    //   throw new Error('Associated tool not found');
    // }
    
    const diffDays = Math.ceil((this.endDate - this.startDate) / 86400000);
    this.totalPrice = (diffDays * tool.dailyLeasePrice * this.quantity) + this.deliveryCharge;
  }
  next();
});


// Add this to your pre-save hook to handle inventory updates
LeaseSchema.pre('save', async function(next) {
  const Equipment = this.model('eqipment'); // Make sure this matches your equipment model name
  
  // Calculate price if dates changed
  if (this.isModified('startDate') || this.isModified('endDate')) {
    const tool = await Equipment.findById(this.tool);
    const diffDays = Math.ceil((this.endDate - this.startDate) / 86400000);
    this.totalPrice = (diffDays * tool.dailyLeasePrice * this.quantity) + this.deliveryCharge;
  }

  // Handle inventory adjustments
  if (this.isNew) {
    // New lease - decrease equipment quantity
    await Equipment.findByIdAndUpdate(
      this.tool,
      { $inc: { quantityAvailable: -this.quantity } },
      { new: true }
    );
  } else if (this.isModified('quantity')) {
    // Quantity changed - adjust inventory difference
    const original = await this.constructor.findById(this._id);
    const quantityDiff = original.quantity - this.quantity;
    await Equipment.findByIdAndUpdate(
      this.tool,
      { $inc: { quantityAvailable: quantityDiff } },
      { new: true }
    );
  }
  
  next();
});

// Add this to handle inventory when leases are deleted/cancelled
LeaseSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await mongoose.model('Equipment').findByIdAndUpdate(
      doc.tool,
      { $inc: { quantityAvailable: doc.quantity } },
      { new: true }
    );
  }
});

const LeaseModel=mongoose.model('lease', LeaseSchema);

module.exports = LeaseModel