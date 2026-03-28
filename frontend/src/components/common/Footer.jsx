// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-16">
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AD</span>
          </div>
          <span className="font-bold text-xl text-white">ApnaDukaan</span>
        </div>
        <p className="text-sm text-gray-400">Empowering local retail through AI-driven commerce. Shop local, shop smart.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className="hover:text-green-400 transition-colors">Home</Link></li>
          <li><Link to="/shops" className="hover:text-green-400 transition-colors">Browse Shops</Link></li>
          <li><Link to="/register" className="hover:text-green-400 transition-colors">Register</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">For Sellers</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/register" className="hover:text-green-400 transition-colors">Become a Seller</Link></li>
          <li><Link to="/seller/dashboard" className="hover:text-green-400 transition-colors">Seller Dashboard</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Contact</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><FiMail size={14} /> support@apnadukaan.in</li>
          <li className="flex items-center gap-2"><FiPhone size={14} /> +91 98765 43210</li>
          <li className="flex items-center gap-2"><FiMapPin size={14} /> Vijayawada, AP</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
      © {new Date().getFullYear()} ApnaDukaan. All rights reserved.
    </div>
  </footer>
);

export default Footer;
