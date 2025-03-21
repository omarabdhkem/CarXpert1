import mongoose from 'mongoose';
import dotenv from 'dotenv';

// تحميل المتغيرات البيئية
dotenv.config();

// MongoDB connection with better error handling
export async function connectMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set, skipping MongoDB connection');
      return false;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// AI Analytics Schema
const aiAnalyticsSchema = new mongoose.Schema({
  userId: Number,
  carId: Number,
  event: String, // search, view, compare, etc.
  metadata: mongoose.Schema.Types.Mixed,
  predictions: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

// Content Management Schema
const contentSchema = new mongoose.Schema({
  type: String, // article, review, comparison, etc.
  title: String,
  content: String,
  tags: [String],
  relatedCars: [Number],
  author: Number, // userId
  status: String,
  seoMetadata: {
    keywords: [String],
    description: String,
    canonical: String
  },
  analytics: {
    views: Number,
    shares: Number,
    engagement: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Behavior Schema
const userBehaviorSchema = new mongoose.Schema({
  userId: Number,
  behaviors: [{
    type: String, // search, view, compare, etc.
    data: mongoose.Schema.Types.Mixed,
    timestamp: Date
  }],
  preferences: mongoose.Schema.Types.Mixed,
  recommendations: [{
    carId: Number,
    score: Number,
    reason: String,
    timestamp: Date
  }]
});

// Search History Schema
const searchHistorySchema = new mongoose.Schema({
  userId: Number,
  query: String,
  filters: mongoose.Schema.Types.Mixed,
  results: [Number], // carIds
  timestamp: { type: Date, default: Date.now }
});

// Export models
export const AIAnalytics = mongoose.model('AIAnalytics', aiAnalyticsSchema);
export const Content = mongoose.model('Content', contentSchema);
export const UserBehavior = mongoose.model('UserBehavior', userBehaviorSchema);
export const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);