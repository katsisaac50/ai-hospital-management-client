#!/bin/bash

# Hospital Management System Backend Setup Script
# This will create all necessary files and folder structure

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is installed
# if ! command -v mongod &> /dev/null; then
#     echo "MongoDB is not installed. Please install MongoDB first."
#     exit 1
# fi

# Create project directory
mkdir -p hospital-management-backend
cd hospital-management-backend

# Initialize npm project
npm init -y

# Install dependencies
echo "Installing dependencies..."
npm install express mongoose bcryptjs jsonwebtoken cors dotenv helmet morgan express-rate-limit express-mongo-sanitize
npm install --save-dev nodemon

# Create folder structure
mkdir -p config controllers models routes middlewares utils

# Create config files
cat > config/db.js << 'EOL'
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
EOL

cat > config/env.js << 'EOL'
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
EOL

# Create models
cat > models/user.model.js << 'EOL'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist'],
    default: 'receptionist',
  },
  department: {
    type: String,
    enum: ['emergency', 'cardiology', 'neurology', 'pediatrics', 'pharmacy', 'laboratory', 'administration'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
EOL

# Create additional models (patient, appointment, doctor, medication, labTest, billing)
# ... [Add all the other model files we created earlier] ...

# Create controllers
cat > controllers/auth.controller.js << 'EOL'
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ... [Add all the other controller methods we created earlier] ...
EOL

# Create additional controllers (patient, appointment, doctor, pharmacy, lab, financial)
# ... [Add all the other controller files we created earlier] ...

# Create routes
cat > routes/auth.routes.js << 'EOL'
const express = require('express');
const {
  register,
  login,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
EOL

# Create additional routes (patient, appointment, doctor, pharmacy, lab, financial)
# ... [Add all the other route files we created earlier] ...

# Create middlewares
cat > middlewares/auth.middleware.js << 'EOL'
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ErrorResponse = require('../utils/errorResponse');
const config = require('../config/env');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
EOL

cat > middlewares/error.middleware.js << 'EOL'
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log(err.stack.red);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
EOL

# Create utils
cat > utils/advancedResults.js << 'EOL'
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 25;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

const advancedResults = (model, populate) => async (req, res, next) => {
  try {
    // Execute query
    let query = new APIFeatures(model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    if (populate) {
      query = query.query.populate(populate);
    }

    const results = await query.query;

    res.advancedResults = {
      success: true,
      count: results.length,
      data: results,
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = advancedResults;
EOL

cat > utils/errorResponse.js << 'EOL'
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
EOL

cat > utils/async.js << 'EOL'
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
EOL

# Create server.js
cat > server.js << 'EOL'
const express = require('express');
const connectDB = require('./config/db');
const config = require('./config/env');
const morgan = require('morgan');
const colors = require('colors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middlewares/error.middleware');

// Route files
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const doctorRoutes = require('./routes/doctor.routes');
const pharmacyRoutes = require('./routes/pharmacy.routes');
const labRoutes = require('./routes/lab.routes');
const financialRoutes = require('./routes/financial.routes');

// Connect to database
connectDB();

// Initialize express
const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/financial', financialRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = config.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${config.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
};
EOL

# Create .env file
cat > .env << 'EOL'
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
EOL

# Create .gitignore
cat > .gitignore << 'EOL'
node_modules/
.env
.DS_Store
EOL

# Update package.json scripts
npm pkg set scripts.start="node server.js"
npm pkg set scripts.dev="nodemon server.js"

echo "Hospital Management System backend setup complete!"
echo "Run 'npm run dev' to start the development server"