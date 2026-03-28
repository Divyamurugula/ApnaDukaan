import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiClock } from 'react-icons/fi';

const ShopCard = ({ shop }) => (
  <Link to={`/shops/${shop._id}`} className="card group block p-4 hover:border-green-200 border border-transparent">
    <div className="flex items-start gap-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-green-50">
        {shop.logo ? (
          <img src={shop.logo} alt={shop.shopName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-100">
            <span className="text-green-700 font-bold text-xl">{shop.shopName[0]}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 truncate group-hover:text-green-600 transition-colors">
            {shop.shopName}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {shop.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <p className="text-xs text-gray-500 capitalize mb-1">{shop.category}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FiStar size={11} className="text-yellow-400 fill-yellow-400" />
            {shop.rating?.toFixed(1)} ({shop.totalRatings})
          </span>
          <span className="flex items-center gap-1">
            <FiMapPin size={11} />
            {shop.location?.city || 'Local'}
          </span>
          <span className="flex items-center gap-1">
            <FiClock size={11} />
            {shop.openingHours?.open} – {shop.openingHours?.close}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

export default ShopCard;
