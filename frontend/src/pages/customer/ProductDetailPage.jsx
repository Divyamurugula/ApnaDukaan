import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiHeart, FiStar, FiMinus, FiPlus } from 'react-icons/fi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    const result = addToCart(product, qty);
    if (result?.error) toast.error(result.error);
    else toast.success('Added to cart!');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, review);
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Spinner />;
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  const discountPct = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
            <img
              src={product.images?.[activeImg] || 'https://via.placeholder.com/500?text=Product'}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${activeImg === i ? 'border-green-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <Link to={`/shops/${product.shop?._id}`} className="text-green-600 text-sm font-medium hover:underline">
            {product.shop?.shopName}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1 mb-2">{product.productName}</h1>

          <div className="flex items-center gap-2 mb-3">
            {[1,2,3,4,5].map(s => (
              <FiStar key={s} size={16} className={s <= product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
            ))}
            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">₹{(product.discountedPrice || product.price).toFixed(2)}</span>
            {discountPct > 0 && <>
              <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
              <span className="bg-orange-100 text-orange-700 text-sm font-bold px-2 py-0.5 rounded-full">{discountPct}% OFF</span>
            </>}
          </div>

          <p className="text-gray-600 text-sm mb-4">{product.description || 'No description available.'}</p>

          <div className="text-sm text-gray-500 mb-5 space-y-1">
            <p>Category: <span className="text-gray-700">{product.category?.name}</span></p>
            <p>Unit: <span className="text-gray-700">{product.unit}</span></p>
            <p>Availability: <span className={product.isAvailable ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
              {product.isAvailable ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span></p>
          </div>

          {product.isAvailable && user?.role === 'customer' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><FiMinus size={14} /></button>
                <span className="px-4 py-2 font-semibold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 hover:bg-gray-100 transition-colors"><FiPlus size={14} /></button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2 flex-1 justify-center py-2.5">
                <FiShoppingCart /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
          {product.reviews?.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((r, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{r.user?.name || 'User'}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <FiStar key={s} size={12} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No reviews yet.</p>}
        </div>

        {user?.role === 'customer' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h2>
            <form onSubmit={submitReview} className="card p-4 space-y-3">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(r => (
                  <button key={r} type="button" onClick={() => setReview(prev => ({ ...prev, rating: r }))}
                    className={`text-2xl transition-transform hover:scale-110 ${r <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={review.comment}
                onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience..."
                rows={3}
                className="input-field resize-none"
              />
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
