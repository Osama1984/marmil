'use client';
import React, { useState, useEffect } from 'react';
import DropZone from '@/app/components/DropZone';
import Options from '@/app/components/Options';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import { useAppSelector } from '@/lib/hooks';

interface Option {
  key: string;
  value: string;
}

interface ProductData {
  _id?: string; // Adding ID for product updates
  name: string;
  price: number;
  category: string;
  mainImage: File | string | null; // Can be File (for new uploads) or URL string (for fetched data)
  otherImages: (File | string)[]; // Can be File (for new uploads) or URL string (for fetched data)
  options: Option[];
}

const Dashboard = () => {
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    price: 0,
    category: '',
    mainImage: null,
    otherImages: [],
    options: [],
  });

  const [userProducts, setUserProducts] = useState<any[]>([]); // State to store the user products
  const user = useAppSelector((state) => state.user); // Access user from Redux

  // Fetch product data when in edit mode
  useEffect(() => {
    fetchUserProducts();
    if (productData._id) {
      fetchProductById(productData._id);
    }
  }, [productData._id]);

  const fetchProductById = async (id: string) => {
    const response = await fetch(`/api/getProductById?id=${id}`);
    const result = await response.json();
    if (result.product) {
      // If the product has an image URL, keep it as a string
      setProductData({
        ...result.product,
        mainImage: result.product.mainImage || null, // It may be a string URL
        otherImages: result.product.otherImages || [], // It may contain URLs
      });
    }
  };

  const handleMainImageDrop = (acceptedFiles: File[]) => {
    setProductData((prevData) => ({
      ...prevData,
      mainImage: acceptedFiles[0], // Store the new file for main image
    }));
  };

  const handleOtherImagesDrop = (acceptedFiles: File[]) => {
    setProductData((prevData) => ({
      ...prevData,
      otherImages: [...prevData.otherImages, ...acceptedFiles], // Add new images to otherImages
    }));
  };

  const handleRemoveImage = (image: File | string | null, imageType: 'main' | 'other', index?: number) => {
    setProductData((prevData) => {
      if (imageType === 'main') {
        return {
          ...prevData,
          mainImage: null,
        };
      } else if (imageType === 'other' && index !== undefined) {
        const updatedOtherImages = prevData.otherImages.filter((_, i) => i !== index);
        return {
          ...prevData,
          otherImages: updatedOtherImages,
        };
      }
      return prevData;
    });
  };

  const handleOptionsChange = (newOptions: Option[] | ((prevState: Option[]) => Option[])) => {
    setProductData((prevData) => ({
      ...prevData,
      options: newOptions instanceof Function ? newOptions(prevData.options) : newOptions,
    }));
  };

  const handleAddOption = () => {
    handleOptionsChange((prevOptions) => [
      ...prevOptions,
      { key: '', value: '' },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const formData = new FormData();
  
    // Append regular fields (name, price, category, etc.)
    formData.append('userId', user.id);
    formData.append('name', productData.name);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
  
    // If this is an update, append the product ID
    if (productData._id) {
      formData.append('id', productData._id);
    }
  
    // Handle main image
    if (productData.mainImage) {
      if (typeof productData.mainImage === 'string') {
        // If mainImage is a string (URL), just append the URL
        formData.append('mainImage', productData.mainImage);
      } else if (productData.mainImage instanceof File) {
        // If mainImage is a File (image uploaded by the user), append the file
        formData.append('mainImage', productData.mainImage);
      }
    } else if (!productData._id) {
      // If the main image is not provided and this is a new product (no product ID), show an error
      toast.error('Main image is required for new products.');
      return;
    }
  
    // Handle other images
    productData.otherImages.forEach((image) => {
      if (image instanceof File) {
        formData.append('otherImages', image);
      } else if (typeof image === 'string') {
        // If it's a string (URL), append the URL
        formData.append('otherImages', image);
      }
    });
  
    // Append options
    formData.append('options', JSON.stringify(productData.options));
  
    try {
        console.log(productData._id)
      const response = await fetch(productData._id ? '/api/updateProduct' : '/api/createProduct', {
        method: 'POST',
        body: formData, // Send as form-data
      });
  
      const result = await response.json();
  
      if (response.ok) {
        toast.success('Product saved successfully!');
        setProductData({
          name: '',
          price: 0,
          category: '',
          mainImage: null,
          otherImages: [],
          options: [],
        });
        await fetchUserProducts();
      } else {
        toast.error(result.Message || 'Error saving product!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred!');
      console.error(error);
    }
  };

  const fetchUserProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getUserProducts?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setUserProducts(data.products);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      setError('An error occurred while fetching products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full sm:max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-lg text-slate-500">
      <h1 className="text-3xl font-bold text-center mb-6">{productData._id ? 'Edit' : 'Add'} Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name, Price, Category */}
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={productData.name}
            onChange={(e) => setProductData({ ...productData, name: e.target.value })}
            placeholder="Product Name"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
          <input
            type="number"
            value={productData.price}
            onChange={(e) => setProductData({ ...productData, price: Number(e.target.value) })}
            placeholder="Product Price"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
          <select
            value={productData.category}
            onChange={(e) => setProductData({ ...productData, category: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          >
            <option value="">Select Category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        {/* Main Image Preview */}
        {productData.mainImage && typeof productData.mainImage === 'string' ? (
          <div className="mt-4">
            <img
              src={productData.mainImage}
              alt="Main Product"
              className="w-full h-auto mb-2 rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(productData.mainImage, 'main')}
              className="text-red-600 hover:text-red-800"
            >
              Remove Main Image
            </button>
          </div>
        ) : productData.mainImage instanceof File ? (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(productData.mainImage)}
              alt="Main Product"
              className="w-full h-auto mb-2 rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(productData.mainImage, 'main')}
              className="text-red-600 hover:text-red-800"
            >
              Remove Main Image
            </button>
          </div>
        ) : null}

        {/* Main Image Dropzone */}
        <DropZone
          onDrop={handleMainImageDrop}
          accept={{
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/heic': [],
            'image/jfif': [],
          }}
          maxFiles={1}
          label="Main Product Image"
          className="mt-6 w-full"
        />

        {/* Other Images Preview */}
        {productData.otherImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {productData.otherImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                  alt={`Additional Image ${index + 1}`}
                  className="w-full h-auto rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image, 'other', index)}
                  className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Other Images Dropzone */}
        <DropZone
          onDrop={handleOtherImagesDrop}
          accept={{
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/heic': [],
            'image/jfif': [],
          }}
          maxFiles={5}
          multiple
          label="Additional Product Images"
          className="mt-6 w-full"
        />

        {/* Button to Add More Options */}
        <button
          type="button"
          onClick={handleAddOption}
          className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 mt-4"
        >
          Add More Options
        </button>

        {/* Options Component */}
        <Options options={productData.options} setOptions={handleOptionsChange} />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
        >
          Save Product
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Your Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProducts.length > 0 ? (
            userProducts.map((product) => (
              <div key={product.id} className="p-4 bg-gray-100 rounded-md shadow-md">
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p>Price: ${product.price}</p>
                <p>Category: {product.category}</p>
                <button
                  onClick={() => setProductData({ ...product, id: product.id })}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>

      {/* React Toastify container */}
      <ToastContainer />
    </div>
  );
};

export default Dashboard;
