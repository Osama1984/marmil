import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/connection';  // Adjust as per your setup
import User from '@/app/models/User'; // Adjust as per your project
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json(); // Get the email and password from the request body

        // Validate input
        if (!email || !password) {
            return NextResponse.json({ Message: "Please provide both email and password." }, { status: 400 });
        }

        // Connect to the database
        await connectDB();

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ Message: "Invalid email or password." }, { status: 401 });  // Unauthorized
        }

        // Check if the user is active
        if (!user.isActive) {
            return NextResponse.json({ Message: "Your account is not active. Please check your email for verification." }, { status: 403 }); // Forbidden
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ Message: "Invalid email or password." }, { status: 401 }); // Unauthorized
        }

        // If password is valid, generate a JWT
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

        // Return success and the token
        return NextResponse.json({ Message: "Login successful", token }, { status: 200 });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ Message: "An error occurred during login." }, { status: 500 }); // Internal Server Error
    }
}
