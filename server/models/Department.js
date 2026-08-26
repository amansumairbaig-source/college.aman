const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lead: { type: String, required: true },
  email: { type: String, required: true },
  icon: { type: String, default: 'tool' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
