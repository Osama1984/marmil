'use client';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation';
import { closeMobileMenu, setCurrentPath } from "@/lib/features/UISlice";

// Assuming you have a product type defined
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  mainImage: string;
  user: {
    username: string;
    email: string;
    profileImage: string;
  };
}

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);
  const currentPath = useAppSelector((state) => state.ui.currentPath);
  const path = usePathname();

  // Pagination state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [limit] = useState<number>(10); // Items per page

  // Fetch products when the component mounts or when the page changes
  useEffect(() => {
    // Close mobile menu if route changes
    if (isMobileMenuOpen && path !== currentPath) {
      dispatch(closeMobileMenu());
    }
    dispatch(setCurrentPath(path));

    // Fetch products with pagination
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/getAllProducts?page=${currentPage}&limit=${limit}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
          setTotalPages(data.totalPages);
        } else {
          setError('Failed to load products.');
        }
      } catch (error) {
        setError('An error occurred while fetching products.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [path, isMobileMenuOpen, currentPath, dispatch, currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="w-full bg-gray-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">All Products</h1>

      {/* Loading or Error State */}
      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 w-full"
            >
              {/* Product Image */}
              <div className="relative w-full h-72 mb-6 overflow-hidden rounded-lg">
                <Image
                  src={product.mainImage}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 truncate">{product.name}</h3>
                <p className="text-lg text-green-600 mt-2">${product.price}</p>
                <p className="text-sm text-gray-500 mt-1">{product.category}</p>

                {/* User Info */}
                <div className="mt-6 flex items-center justify-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    {/* Display user's profile image */}
                    {product.user.profileImage ? (
                      <Image
                        src={product.user.profileImage}
                        alt={product.user.username}
                        width={64}
                        height={64}
                        className="rounded-full border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-xl">
                        {product.user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <h4 className="font-semibold text-gray-700">{product.user.username}</h4>
                    <p className="text-sm text-gray-600">{product.user.email}</p>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No products available.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 w-full">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 mx-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="self-center text-lg text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 mx-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
