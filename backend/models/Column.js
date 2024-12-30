const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
    name: { type: String, required: true },
    order: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const Column = mongoose.model('Column', columnSchema);
module.exports = Column;