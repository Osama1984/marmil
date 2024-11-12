import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/connection';
import Product from '@/app/models/Product';
import User from '@/app/models/User';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser to handle multipart form-data manually
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const productId = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = Number(formData.get('price')) as number;
    const category = formData.get('category') as string;
    const userId = formData.get('userId') as string;
    const options = JSON.parse(formData.get('options') as string);
    
    const mainImage = formData.get('mainImage');
    const otherImages = formData.getAll('otherImages');

    if (!productId) {
      return NextResponse.json({ Message: "Product ID is required." }, { status: 400 });
    }

    if (!name || !price || !category || !userId) {
      return NextResponse.json({ Message: "Missing required fields." }, { status: 400 });
    }

    // Connect to DB
    await connectDB();

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ Message: "Product not found." }, { status: 404 });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ Message: "User not found." }, { status: 404 });
    }

    // Handle Main Image
    let updatedMainImage = product.mainImage;

    if (mainImage instanceof File) {
      const mainImagePath = await saveImageToFileSystem(mainImage);
      
      // Delete old main image if it exists and is different
      if (product.mainImage && product.mainImage !== mainImagePath) {
        await deleteOldImage(product.mainImage);
      }
      
      updatedMainImage = mainImagePath; // Set new main image path
    }

    // Handle Other Images
    let updatedOtherImages = [...product.otherImages];

    if (otherImages.length > 0) {
      const newOtherImages: string[] = [];

      for (const image of otherImages) {
        if (image instanceof File) {
          const imagePath = await saveImageToFileSystem(image);
          newOtherImages.push(imagePath);
        } else if (typeof image === 'string') {
          newOtherImages.push(image); // If image is already a URL, keep it
        }
      }

      // Merge existing and new other images
      updatedOtherImages = [...newOtherImages];
    }

    // Update product fields
    const updatedProduct = await Product.updateOne(
      { _id: productId },  // Find product by its ID
      {                   // Update fields
        $set: {
          name: name,
          price: price,
          category: category,
          mainImage: updatedMainImage,
          otherImages: updatedOtherImages,
          options: options
        }
      }
    );

    if (updatedProduct.modifiedCount > 0) {
      return NextResponse.json({
        Message: "Product updated successfully",
        product: updatedProduct,  // Return the updated product object
      }, { status: 200 });
    } else {
      return NextResponse.json({ Message: "Product update failed or no changes made." }, { status: 400 });
    }

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ Message: "Error updating product." }, { status: 500 });
  }
}

// Helper function to save image to file system
async function saveImageToFileSystem(file: File) {
  const fileName = Date.now() + '-' + file.name; // Unique filename using timestamp
  const filePath = path.join(process.cwd(), 'public', 'images', fileName); // Save to public/images

  const buffer = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));

  return '/images/' + fileName; // Return the relative path to the image
}

// Helper function to delete old image
async function deleteOldImage(imageUrl: string) {
  try {
    const imagePath = path.join(process.cwd(), 'public', 'images', path.basename(imageUrl)); // Get image path from URL
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Delete old image
    }
  } catch (err) {
    console.error("Error deleting old image:", err);
  }
}
