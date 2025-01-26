const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  modules: [{
    title: String,
    description: String,
    content: String,
    videoUrl: String,
    duration: Number,
    order: Number,
    quiz: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      points: Number
    }]
  }],
  prerequisites: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  }],
  tags: [String],
  thumbnail: String,
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
courseSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

module.exports = mongoose.model('Course', courseSchema);
