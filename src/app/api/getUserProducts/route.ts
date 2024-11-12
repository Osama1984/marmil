import { NextResponse } from 'next/server';
import  connect  from '@/app/config/connection'; // Assuming you have a utility function to connect to your DB
import Product from '@/app/models/Product'; // Assuming you have a Product model

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // Get userId from query params
    console.log(userId);
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Connect to the database
    await connect();

    // Fetch products associated with the user
    const products = await Product.find({ user:userId });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}
