const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addCourseReview,
  enrollCourse
} = require('../controllers/courseController');
const { protect, instructor } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', getCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get single course
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
router.get('/:id', getCourse);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags: [Courses]
 *     summary: Create new course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, difficulty]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *     responses:
 *       201:
 *         description: Course created
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, instructor, createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     tags: [Courses]
 *     summary: Update course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *     responses:
 *       200:
 *         description: Course updated
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course not found
 */
router.put('/:id', protect, instructor, updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Delete course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course not found
 */
router.delete('/:id', protect, instructor, deleteCourse);

/**
 * @swagger
 * /api/courses/{id}/reviews:
 *   post:
 *     tags: [Courses]
 *     summary: Add course review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 *       400:
 *         description: Already reviewed
 *       404:
 *         description: Course not found
 */
router.post('/:id/reviews', protect, addCourseReview);

/**
 * @swagger
 * /api/courses/{id}/enroll:
 *   post:
 *     tags: [Courses]
 *     summary: Enroll in course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully enrolled
 *       400:
 *         description: Already enrolled
 *       404:
 *         description: Course not found
 */
router.post('/:id/enroll', protect, enrollCourse);

module.exports = router;
