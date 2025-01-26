const {
  registerValidation,
  loginValidation,
  courseValidation,
  tradeValidation,
} = require('../utils/validation');

exports.validateRegister = (req, res, next) => {
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

exports.validateLogin = (req, res, next) => {
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

exports.validateCourse = (req, res, next) => {
  const { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

exports.validateTrade = (req, res, next) => {
  const { error } = tradeValidation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};
