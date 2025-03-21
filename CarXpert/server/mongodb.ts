import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carxpert';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  fullName: String,
  phone: String,
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now }
});

// Car Schema
const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  mileage: Number,
  description: String,
  images: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Favorite Schema
const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Export models
export const UserModel = mongoose.model('User', userSchema);
export const CarModel = mongoose.model('Car', carSchema);
export const FavoriteModel = mongoose.model('Favorite', favoriteSchema);
