import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/connection';
import Product from '@/app/models/Product';
import User from '@/app/models/User';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle multipart/form-data manually
  },
};

export async function POST(request: NextRequest) {
  try {
    // Parse the form data using formData() (Next.js built-in function for handling multipart/form-data)
    const formData = await request.formData();
    console.log(formData);

    // Extract text fields from the form data
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const userId = formData.get('userId') as string;

    // Extract the options field (it might be a stringified JSON object)
    const options = formData.get('options');
    let parsedOptions = [];
    if (options) {
      parsedOptions = JSON.parse(options as string); // Assuming options are passed as JSON string
    }

    // Extract the uploaded images (main image and other images)
    const mainImage = formData.get('mainImage');
    const otherImages = formData.getAll('otherImages'); // Get all other images if there are multiple

    // Validate input fields
    if (!name || !price || !category || !userId) {
      return NextResponse.json({ Message: "Missing required fields: name, price, category, userId." }, { status: 400 });
    }

    if (!mainImage) {
      return NextResponse.json({ Message: "Main image is required." }, { status: 400 });
    }

    if (parsedOptions.some((option: {key:string, value:string}) => !option.key || !option.value)) {
      return NextResponse.json({ Message: "Options must have both a key and a value." }, { status: 400 });
    }

    // Connect to the database
    await connectDB();

    // Find the user who is creating the product
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ Message: "User not found." }, { status: 404 });
    }

    // Directory to save images
    const uploadDir = path.join(process.cwd(), '/tmp', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Handle main image upload or URL
    let mainImagePath = null;
    if (mainImage instanceof File) {
      // If mainImage is a file (image uploaded by the user), save it to disk
      const mainImageFilename = `${Date.now()}-${mainImage.name}`;
      const mainImagePathOnDisk = path.join(uploadDir, mainImageFilename);
      const buffer = await mainImage.arrayBuffer();
      const fileBuffer = Buffer.from(buffer);
      fs.writeFileSync(mainImagePathOnDisk, fileBuffer);
      mainImagePath = `/tmp/uploads/${mainImageFilename}`;
    } else if (typeof mainImage === 'string') {
      // If mainImage is a string (URL), directly use the URL
      mainImagePath = mainImage; // No file upload needed
    }

    // Handle other images upload (if any)
    const otherImagePaths = [];
    for (const file of otherImages) {
      if (file instanceof File) {
        const otherImageFilename = `${Date.now()}-${file.name}`;
        const otherImagePathOnDisk = path.join(uploadDir, otherImageFilename);
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        fs.writeFileSync(otherImagePathOnDisk, fileBuffer);
        otherImagePaths.push(`/tmp/uploads/${otherImageFilename}`);
      } else if (typeof file === 'string') {
        // If it's a string (URL), directly append it
        otherImagePaths.push(file);
      }
    }

    // Create the new product object
    const newProduct = new Product({
      name,
      price,
      category,
      mainImage: mainImagePath, // Either a path or a URL
      otherImages: otherImagePaths,
      options: parsedOptions,
      user: user._id, // Reference to the user who created the product
    });

    // Save the product to the database
    await newProduct.save();

    // Return success response with the new product
    return NextResponse.json({
      Message: "Product created successfully",
      product: newProduct,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ Message: "An error occurred while creating the product." }, { status: 500 });
  }
}
