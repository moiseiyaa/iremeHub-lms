const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  imageUrl: String,
  templateUsed: String,
  metadata: {
    courseCompletionDate: Date,
    grade: String,
    hoursCompleted: Number
  },
  customFields: {
    type: Map,
    of: String
  }
});

module.exports = mongoose.model('Certificate', CertificateSchema); 