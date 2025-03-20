"use client";

import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe, FaEnvelope, FaPhone, FaArrowRight } from 'react-icons/fa';

const Footer = () => {
  
  
  return (
    <footer className="w-full bg-white text-black relative overflow-hidden border">
      
      
      {/* Main footer content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Company info */}
          <div className="md:w-1/3">
            <div className="flex items-center mb-6">
              <img src="/images/logo.svg" alt="Biolabs Logo" className="h-8 mr-2" />
              <h2 className="text-3xl font-bold tracking-tight">
                Biolabs<span className="text-xs  text-gray-600 ml-1">ltd.com</span>
              </h2>
            </div>
            <p className="text-gray-700 mb-6">
              Pioneering technology with cutting-edge research and innovative solutions for a healthier tomorrow.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <FaGithub size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <FaTwitter size={20} />
              </a>
            </div>
          </div>
          
          
          
          {/* Contact info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <FaGlobe className="mr-2 text-gray-500" size={16} />
                <span className="text-gray-600">123 Innovation Drive, Science Park</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-gray-500" size={16} />
                <a href="mailto:info@biolabs.com" className="text-gray-600 hover:text-black transition-colors">
                  info@biolabs.com
                </a>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-2 text-gray-500" size={16} />
                <a href="tel:+1234567890" className="text-gray-600 hover:text-black transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="md:w-1/4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Stay Updated</h3>
            <p className="text-gray-600 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-50 border border-gray-300 rounded-l px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <button 
                type="submit" 
                className="bg-gray-800 hover:bg-gray-700 text-white rounded-r px-4 transition-colors"
              >
                <FaArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Biolabs Ltd. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-black text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-black text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-black text-sm transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
      
      {/* Subtle bottom border */}
      <div className="h-1 w-full bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200"></div>
      
      {/* Add some global styles for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 0.4; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;