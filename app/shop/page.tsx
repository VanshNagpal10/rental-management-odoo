/**
 * Customer Shop Page - Main rental shop after login
 * Shows available products in grid/list view with filtering and search
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { Heart, ShoppingCart, Star, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { IProduct } from '@/types';

export default function ShopPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Categories from the wireframe
  const categories = ['Electronics', 'Furniture', 'Vehicles', 'Tools', 'Sports'];

  // Redirect if not customer
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'customer') {
      router.push('/login');
    }
  }, [session, status, router]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success) {
        // Only show available products
        const availableProducts = data.data.filter((product: IProduct) => product.availability);
        setProducts(availableProducts);
        setFilteredProducts(availableProducts);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle search from URL params
  useEffect(() => {
    const searchQuery = searchParams?.get('search');
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  // Filter products
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => {
      const price = product.pricePerDay || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, priceRange]);

  // Handle search
  const handleSearch = (query: string) => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Add to cart function
  const addToCart = async (product: IProduct) => {
    try {
      // For now, we'll use localStorage for cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.productId === product._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          productId: product._id,
          name: product.name,
          image: product.image,
          pricePerDay: product.pricePerDay,
          quantity: 1
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Add to wishlist function
  const addToWishlist = async (productId: string) => {
    try {
      // For now, we'll use localStorage for wishlist
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        toast.success('Added to wishlist');
      } else {
        toast.info('Already in wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  // Product card component
  const ProductCard = ({ product }: { product: IProduct }) => {
    const defaultImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
    
    return (
      <div className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 ${
        viewMode === 'list' ? 'flex items-center p-4' : 'overflow-hidden'
      }`}>
        {/* Product Image */}
        <div className={`relative ${
          viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'w-full h-48'
        }`}>
          <Image
            src={product.image || defaultImage}
            alt={product.name}
            fill
            className="object-cover"
          />
          <button
            onClick={() => addToWishlist(product._id!)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Product Info */}
        <div className={`${viewMode === 'list' ? 'flex-1 ml-4' : 'p-4'}`}>
          <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
            <div className={viewMode === 'list' ? 'flex-1' : ''}>
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-primary-800 font-bold text-lg">
                ₹{product.pricePerDay}/day
              </p>
              
              {viewMode === 'grid' && (
                <div className="mt-2">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={`${viewMode === 'list' ? 'flex items-center space-x-2' : 'mt-4 flex space-x-2'}`}>
              <button
                onClick={() => addToCart(product)}
                className="flex-1 bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
              
              {viewMode === 'list' && (
                <p className="text-primary-800 font-bold text-lg">
                  ₹{product.pricePerDay}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-800"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout
      title="Rental Shop"
      showSearch={true}
      showViewToggle={true}
      onViewChange={setViewMode}
      currentView={viewMode}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Product Attributes</h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === '' 
                        ? 'bg-primary-800 text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedCategory === category 
                          ? 'bg-primary-800 text-white' 
                          : 'text-gray-600 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center space-x-2 bg-primary-800 text-white px-4 py-2 rounded-md"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Category</h4>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            ) : (
              <>
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-4'
                }`}>
                  {filteredProducts.map((product) => (
                    <Link key={product._id} href={`/shop/product/${product._id}`}>
                      <ProductCard product={product} />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button className="px-3 py-2 text-gray-600 hover:text-primary-800 transition-colors">
                    &lt;
                  </button>
                  <button className="px-3 py-2 bg-primary-800 text-white rounded-full">
                    1
                  </button>
                  <button className="px-3 py-2 text-gray-600 hover:text-primary-800 transition-colors">
                    2
                  </button>
                  <button className="px-3 py-2 text-gray-600 hover:text-primary-800 transition-colors">
                    3
                  </button>
                  <button className="px-3 py-2 text-gray-600 hover:text-primary-800 transition-colors">
                    4
                  </button>
                  <span className="px-3 py-2 text-gray-600">...</span>
                  <button className="px-3 py-2 text-gray-600 hover:text-primary-800 transition-colors">
                    10
                  </button>
                  <button className="px-3 py-2 text-gray-600 hover:text-primary-800 transition-colors">
                    &gt;
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
