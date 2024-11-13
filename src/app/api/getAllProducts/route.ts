import connectDB from '@/app/config/connection';
import Product from '@/app/models/Product';
import { ErrorProps } from 'next/error';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string (default to page 1 and 10 items per page)
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '2', 10);  // default to 2 items per page
    const skip = (page - 1) * limit;

    // Connect to the database
    await connectDB();

    // Fetch products with pagination, and populate the 'user' field with selected user details
    const products = await Product.find()
      .populate('user', 'username email profileImage address phone state zipCode')
      .skip(skip)
      .limit(limit);

    // Get the total count of products
    const totalProducts = await Product.countDocuments();

    // Return paginated data in the response
    return NextResponse.json({
      success: true,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return an error response
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products.', error: error },
      { status: 500 }
    );
  }
}
