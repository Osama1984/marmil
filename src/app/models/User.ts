import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String, required: true },
  profileImage: { type: String, required: true },
  isActive: { type: Boolean, default: false }, // Flag for email verification
  emailVerificationToken: { type: String }, // Token for email verification
  emailVerificationTokenExpiration: { type: Date, required: false }, // New field
}, { timestamps: true }); // Enable automatic timestamps

const User =
	mongoose.models.User || mongoose.model('User', userSchema);
export default User;