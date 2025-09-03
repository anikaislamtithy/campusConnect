require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"]
}));

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

const connectDB = require("./db/connect");

// Import models to ensure they're registered
const User = require('./models/User');
const Course = require('./models/Course');
const Resource = require('./models/Resource');
const StudyGroup = require('./models/StudyGroup');
const ResourceRequest = require('./models/ResourceRequest');
const { Achievement, UserAchievement } = require('./models/Achievement');
const Notification = require('./models/Notification');

// Import routes
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const courseRouter = require('./routes/courseRoutes');
const resourceRouter = require('./routes/resourceRoutes');
const studyGroupRouter = require('./routes/studyGroupRoutes');
const resourceRequestRouter = require('./routes/resourceRequestRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const achievementRouter = require('./routes/achievementRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');


// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// Routes
app.get("/", (req, res) => {
  res.send("<h1>CampusConnect API</h1><p>Academic resource sharing platform for university students</p>");
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/study-groups', studyGroupRouter);
app.use('/api/v1/resource-requests', resourceRequestRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/achievements', achievementRouter);
app.use('/api/v1/dashboard', dashboardRouter);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed database if empty
    const seedDatabase = require('./scripts/seed');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty, seeding with sample data...');
      await seedDatabase();
    }

    app.listen(port, () =>
      console.log(`🚀 Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error('❌ Server startup error:', error);
  }
};

start();
