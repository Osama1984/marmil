import mongoose, { Schema, Document } from 'mongoose';

interface Option {
  key: string;
  value: string;
}

export interface Product extends Document {
  name: string;
  price: number;
  category: string;
  mainImage: string; // URL to the uploaded image
  otherImages: string[]; // Array of URLs for uploaded images
  options: Option[];
  user: mongoose.Schema.Types.ObjectId; // Reference to the User
}

const optionSchema = new Schema<Option>({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const productSchema = new Schema<Product>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  mainImage: { type: String, required: true },
  otherImages: { type: [String], required: true },
  options: { type: [optionSchema], default: [] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add user reference
});

const Product =
	mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;