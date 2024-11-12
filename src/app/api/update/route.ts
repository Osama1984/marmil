import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/connection';
import User from '@/app/models/User';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Make sure the request is parsed as `multipart/form-data` for file uploads
export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle multipart/form-data manually
  },
};

export async function PUT(request: NextRequest) {
  // Parse the form data using formData() (this is the built-in function for Next.js)
  const formData = await request.formData();

  // Extract fields from the form data
  const userId = formData.get('userId') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const address = formData.get('address') as string;
  const selectedState = formData.get('selectedState') as string;
  const zipCode = formData.get('zipCode') as string;

  // Get the uploaded profile image (if it exists)
  const profileImage = formData.get('profileImage');

  try {
    // Validate input
    if (!userId) {
      return NextResponse.json({ Message: "User ID is required." }, { status: 400 });
    }

    // Connect to the database
    await connectDB();

    // Find the user in the database
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ Message: "User not found." }, { status: 404 });
    }

    // Directory to save images
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Check if 'uploads' directory exists, if not, create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // {recursive: true} ensures nested directories are created
    }

    // Initialize the path to the new profile image
    let newProfileImagePath = user.profileImage;

    // If the profile image has been uploaded and is a file (not a string)
    if (profileImage instanceof File) {
      const filename = `${Date.now()}-${profileImage.name}`;
      const imagePath = path.join(uploadDir, filename); // Use the uploadDir path

      // Delete the old image from the file system, if necessary
      const prevImagePath = path.join(process.cwd(), 'public', user.profileImage);
      if (fs.existsSync(prevImagePath) && user.profileImage !== '/uploads/placeholder.jpg') {
        fs.unlinkSync(prevImagePath); // Delete the previous image from the file system
      }

      // Save the new image to the uploads directory
      const buffer = await profileImage.arrayBuffer(); // Get the file as an ArrayBuffer
      const fileBuffer = Buffer.from(buffer); // Convert ArrayBuffer to Buffer
      fs.writeFileSync(imagePath, fileBuffer); // Write the buffer to disk

      newProfileImagePath = `/uploads/${filename}`; // Update the path to the new profile image
    }

    // Update user details (only change fields if a new value is provided)
    user.username = username || user.username;
    user.email = email || user.email;
    user.address = address || user.address;
    user.phone = phoneNumber || user.phone;
    user.profileImage = newProfileImagePath; // Update the profile image URL if necessary
    user.state = selectedState || user.state;
    user.zipCode = zipCode || user.zipCode;

    // Save the updated user to the database
    await user.save();

    // Generate a new token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        address: user.address,
        phoneNumber: user.phone,
        profileImage: user.profileImage,
        selectedState: user.state,
        zipCode: user.zipCode,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      Message: "Profile updated successfully",
      token,
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ Message: "An error occurred while updating the profile." }, { status: 500 });
  }
}
