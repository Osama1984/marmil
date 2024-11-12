import connectDB from '@/app/config/connection';
import Product from '@/app/models/Product';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string (default to page 1 and 10 items per page)
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '2', 4);
    const skip = (page - 1) * limit;

    // Connect to the database
    await connectDB();

    // Fetch products with pagination
    const products = await Product.find().populate('user', 'username email profileImage address phone state zipCode')
      .skip(skip)
      .limit(limit);

    // Get the total count of products
    const totalProducts = await Product.countDocuments();

    // Return paginated data
    return new Response(
      JSON.stringify({
        success: true,
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to fetch products.' }),
      { status: 500 }
    );
  }
}
