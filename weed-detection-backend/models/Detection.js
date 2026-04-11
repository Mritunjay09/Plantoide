const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  // Connects the detection to a specific user (Farmer) [cite: 3, 6]
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Default to Unrecognized if AI confidence is low 
  detectedSpecies: { 
    type: String, 
    required: true,
    default: "Unrecognized" 
  },
  // Metrics like Accuracy, Precision, and Recall from your PPT [cite: 25, 26, 30, 33]
  confidenceScore: { type: Number, required: true },
  
  // Manual Labeling Feature: For unrecognized or wrongly identified plants 
  isManuallyLabeled: { type: Boolean, default: false },
  manualLabelName: { type: String, default: "" }, 

  imageUrl: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  status: {
    type: String,
    enum: ['weed', 'crop', 'unknown'], 
    default: 'unknown'
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Detection', detectionSchema);
