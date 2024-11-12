import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/connection";
import User from "@/app/models/User";

export async function GET(request: NextRequest) {
  // Connect to the database
  await connectDB();

  // Extract the token from the URL search params
  const token = request.nextUrl.searchParams.get("token");

  // If no token is found in the query string, return an error
  if (!token) {
    return NextResponse.json({ Message: "Invalid token.", status: 400 });
  }

  try {
    // Find the user by the email verification token
    const user = await User.findOne({ emailVerificationToken: token });

    // If no user is found, return an error indicating the token is invalid or expired
    if (!user) {
      return NextResponse.json({ Message: "Invalid or expired token.", status: 400 });
    }

    // If token is valid, activate the user and clear the token and its expiration
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiration = undefined;

    // Save the user after updating the fields
    await user.save();

    // Return success message
    return NextResponse.json({ Message: "Email successfully verified.", status: 200 });

  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json({ Message: "An error occurred while verifying the email.", status: 500 });
  }
}
