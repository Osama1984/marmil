import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/app/config/connection"; // Adjust according to your project structure
import User from "@/app/models/User"; // Adjust according to your project structure
import { randomBytes } from "crypto"; // For generating verification token
import nodemailer from "nodemailer"; // For sending email verification links
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier'; // For converting Buffer to stream

// API configuration
export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file handling
  },
};

// Cloudinary configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Constants for file validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Function to send verification email
const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // You can configure this for your preferred email provider
    auth: {
      user: process.env.EMAIL_USER, // Your email user
      pass: process.env.EMAIL_PASSWORD, // Your email password (or app-specific password)
    },
  });

  const verificationLink = `${process.env.BASE_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",
    html: `<p>Please click the following link to verify your email:</p><a href="${verificationLink}">${verificationLink}</a>`,
  };

  await transporter.sendMail(mailOptions);
};

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (buffer: Buffer, publicId: string) => {
  const stream = streamifier.createReadStream(buffer); // Convert buffer to stream

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'image',
        fetch_format: 'auto',
        quality: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error); // Reject the promise on failure
        } else {
          resolve(result); // Resolve the promise with the result
        }
      }
    );
    
    // Pipe the buffer stream to Cloudinary
    stream.pipe(uploadStream);
  });
};

// User registration logic
export async function POST(request: NextRequest) {
  await connectDB(); // Ensure the database connection is established

  try {
    // Parse form data (including files) from the request
    const formData = await request.formData();

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const address = formData.get("address") as string;
    const selectedState = formData.get("selectedState") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const zipCode = formData.get("zipCode") as string;
    const profileImage = formData.get("profileImage") as File | null;

    // Validate required fields
    if (!username || !email || !password || !address || !phoneNumber || !selectedState || !zipCode || !profileImage) {
      return NextResponse.json({ message: "Please fill in all fields.", statusCode: 400 }); // Bad request
    }

    // Validate file type and size
    if (!ALLOWED_IMAGE_TYPES.includes(profileImage.type)) {
      return NextResponse.json({ message: "Invalid file type. Only JPEG and PNG allowed.", statusCode: 400 });
    }

    if (profileImage.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ message: "File size exceeds the 5MB limit.", statusCode: 400 });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists", statusCode: 409 }); // Conflict
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique filename for the profile image
    const cloudinaryPublicId = `user_profile_${Date.now()}_${username}`;

    // Convert the profile image to a buffer
    const buffer = Buffer.from(await profileImage.arrayBuffer());

    // Upload the image to Cloudinary
    const uploadResult = await uploadImageToCloudinary(buffer, cloudinaryPublicId);

    if (!uploadResult) {
      return NextResponse.json({ message: "Cloudinary upload failed", statusCode: 500 });
    }

    // Construct optimized image URL
    const optimizeUrl = cloudinary.url(cloudinaryPublicId, {
      fetch_format: 'auto',
      quality: 'auto',
    });

    // Generate a unique email verification token
    const emailVerificationToken = randomBytes(32).toString("hex");

    // Set the expiration time (1 hour from now)
    const emailVerificationTokenExpiration = new Date();
    emailVerificationTokenExpiration.setHours(emailVerificationTokenExpiration.getHours() + 1);

    // Create a new user instance
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Store the hashed password
      address,
      state: selectedState,
      zipCode,
      phone: phoneNumber,
      profileImage: optimizeUrl, // Save the optimized Cloudinary image URL
      emailVerificationToken, // Save the verification token
      emailVerificationTokenExpiration, // Save the expiration timestamp
    });

    // Save user to the database
    await newUser.save();

    // Send email verification link
    await sendVerificationEmail(email, emailVerificationToken);

    return NextResponse.json({ message: "User registered successfully. Please check your email for verification.", statusCode: 201 }); // Created

  } catch (error) {
    console.error("Error occurred during registration:", error);
    return NextResponse.json({ message: "An error occurred during registration", statusCode: 500 }); // Internal Server Error
  }
}
