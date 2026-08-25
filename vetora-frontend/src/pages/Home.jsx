import React from 'react';
import { Link } from 'react-router-dom';
import { FaDog, FaCalendar, FaFileMedical, FaPrescription, FaStethoscope, FaBell } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section with Image Background */}
      <div className="relative rounded-2xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-emerald-800/90 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&h=400&fit=crop" 
          alt="Happy dog with vet" 
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            🐾 Welcome to VETORA
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Your trusted veterinary appointment and pet healthcare management system
          </p>
          <div className="space-x-4">
            <Link to="/register" className="bg-white text-emerald-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg inline-block">
              🚀 Get Started
            </Link>
            <Link to="/login" className="bg-emerald-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-400 transition-all shadow-lg inline-block">
              🔑 Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow border-t-4 border-emerald-500">
          <div className="text-5xl text-emerald-600 mx-auto mb-4">🐕</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Pet Management</h3>
          <p className="text-gray-600">Register and manage your pets easily</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow border-t-4 border-blue-500">
          <div className="text-5xl text-blue-600 mx-auto mb-4">📅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Book Appointments</h3>
          <p className="text-gray-600">Schedule appointments with top veterinarians</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow border-t-4 border-purple-500">
          <div className="text-5xl text-purple-600 mx-auto mb-4">💊</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Medical Records</h3>
          <p className="text-gray-600">View and manage pet medical records</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow border-t-4 border-pink-500">
          <div className="text-5xl text-pink-600 mx-auto mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Prescriptions</h3>
          <p className="text-gray-600">Electronic prescriptions for your pets</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow border-t-4 border-orange-500">
          <div className="text-5xl text-orange-600 mx-auto mb-4">💉</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Vaccinations</h3>
          <p className="text-gray-600">Track pet vaccinations and reminders</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow border-t-4 border-red-500">
          <div className="text-5xl text-red-600 mx-auto mb-4">⏰</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Reminders</h3>
          <p className="text-gray-600">Get reminders for appointments and medications</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-emerald-50 rounded-2xl p-8 mb-12">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-emerald-700">500+</div>
            <div className="text-gray-600">Happy Pets</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-700">50+</div>
            <div className="text-gray-600">Veterinarians</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-700">1000+</div>
            <div className="text-gray-600">Appointments</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-700">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl p-10 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-lg mb-6">Join thousands of pet owners who trust VETORA</p>
        <Link to="/register" className="bg-white text-emerald-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg inline-block">
          🚀 Create Your Account Now
        </Link>
      </div>
    </div>
  );
};

export default Home;