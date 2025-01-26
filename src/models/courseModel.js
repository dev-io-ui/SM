const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  thumbnail: String,
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalEnrollments: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  prerequisites: [{
    type: String
  }],
  learningOutcomes: [{
    type: String
  }],
  resources: [{
    title: String,
    type: String,
    url: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completion percentage
courseSchema.virtual('completionPercentage').get(function() {
  if (!this.modules.length) return 0;
  const completedModules = this.modules.filter(module => module.isCompleted).length;
  return (completedModules / this.modules.length) * 100;
});

// Index for search
courseSchema.index({ title: 'text', description: 'text', category: 'text' });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
