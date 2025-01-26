const asyncHandler = require('express-async-handler');
const Course = require('../database/models/courseModel');
const User = require('../database/models/userModel');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const { difficulty, search, sort } = req.query;
  let query = {};

  // Filter by difficulty
  if (difficulty) {
    query.difficulty = difficulty;
  }

  // Search by title or description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Only show published courses for non-admin users
  if (!req.user || req.user.role !== 'admin') {
    query.isPublished = true;
  }

  let courses = Course.find(query).populate('instructor', 'name email');

  // Sorting
  if (sort) {
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    const sortField = sort.replace('-', '');
    courses = courses.sort({ [sortField]: sortOrder });
  } else {
    courses = courses.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Course.countDocuments(query);

  courses = await courses.skip(startIndex).limit(limit);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: courses.length,
    pagination,
    data: courses
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email')
    .populate('prerequisites', 'title description');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = asyncHandler(async (req, res) => {
  req.body.instructor = req.user.id;

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Make sure user is course instructor
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this course');
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Make sure user is course instructor
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this course');
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add course review
// @route   POST /api/courses/:id/reviews
// @access  Private
const addCourseReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user already reviewed
  const alreadyReviewed = course.reviews.find(
    review => review.user.toString() === req.user.id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Course already reviewed');
  }

  const review = {
    user: req.user.id,
    rating: Number(rating),
    comment
  };

  course.reviews.push(review);
  course.rating = course.reviews.reduce((acc, item) => item.rating + acc, 0) / course.reviews.length;

  await course.save();

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if already enrolled
  const alreadyEnrolled = user.progress.completedCourses.some(
    enrolledCourse => enrolledCourse.courseId.toString() === course._id.toString()
  );

  if (alreadyEnrolled) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  // Add course to user's enrolled courses
  user.progress.completedCourses.push({
    courseId: course._id,
    completedAt: null,
    score: 0
  });

  // Increment course enrollment count
  course.enrollmentCount += 1;

  await Promise.all([user.save(), course.save()]);

  res.status(200).json({
    success: true,
    message: 'Successfully enrolled in course'
  });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addCourseReview,
  enrollCourse
};
