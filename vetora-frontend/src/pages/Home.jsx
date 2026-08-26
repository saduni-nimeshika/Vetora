import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaDog, FaCalendar, FaFileMedical, FaPrescription, 
  FaStethoscope, FaBell, FaArrowRight, FaShieldAlt, 
  FaStar, FaUsers, FaClock, FaHeart 
} from 'react-icons/fa';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700/95 to-emerald-900/95 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1400&h=500&fit=crop" 
          alt="Happy dog with vet" 
          className="w-full h-[480px] object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="text-sm font-medium">🐾 Trusted by 1000+ pet owners</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
            Welcome to <span className="text-emerald-300">VETORA</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-gray-200">
            Your trusted veterinary appointment and pet healthcare management system
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-2xl flex items-center gap-2 group">
              🚀 Get Started 
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="bg-emerald-500/90 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all border border-white/20">
              🔑 Login
            </Link>
          </div>
          <div className="flex gap-8 mt-8 text-sm text-gray-300">
            <span className="flex items-center gap-1"><FaShieldAlt className="text-emerald-400" /> Secure</span>
            <span className="flex items-center gap-1"><FaStar className="text-yellow-400" /> Trusted</span>
            <span className="flex items-center gap-1"><FaUsers className="text-emerald-400" /> 1000+ Users</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-xl">
          <div className="text-3xl font-extrabold text-emerald-600">500+</div>
          <div className="text-gray-500 text-sm">Happy Pets</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-xl">
          <div className="text-3xl font-extrabold text-emerald-600">50+</div>
          <div className="text-gray-500 text-sm">Veterinarians</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-xl">
          <div className="text-3xl font-extrabold text-emerald-600">1000+</div>
          <div className="text-gray-500 text-sm">Appointments</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-xl">
          <div className="text-3xl font-extrabold text-emerald-600">98%</div>
          <div className="text-gray-500 text-sm">Satisfaction</div>
        </div>
      </div>

      {/* Features Grid */}
      <h2 className="text-3xl font-bold text-center mb-12">
        <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
          Everything
        </span> you need for your pet
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100/50 group">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FaDog className="text-3xl text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Pet Management</h3>
          <p className="text-gray-500 text-sm">Register and manage your pets easily</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100/50 group">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FaCalendar className="text-3xl text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Book Appointments</h3>
          <p className="text-gray-500 text-sm">Schedule with top veterinarians</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100/50 group">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FaFileMedical className="text-3xl text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Medical Records</h3>
          <p className="text-gray-500 text-sm">View pet medical history</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100/50 group">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FaPrescription className="text-3xl text-pink-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Prescriptions</h3>
          <p className="text-gray-500 text-sm">Electronic prescriptions</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100/50 group">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FaStethoscope className="text-3xl text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Vaccinations</h3>
          <p className="text-gray-500 text-sm">Track pet vaccinations</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100/50 group">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FaBell className="text-3xl text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Reminders</h3>
          <p className="text-gray-500 text-sm">Get appointment reminders</p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-3xl p-12 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <FaHeart className="text-5xl text-emerald-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to get started? 🚀</h2>
          <p className="text-emerald-100 mb-8">
            Join thousands of pet owners who trust VETORA for their pet's healthcare
          </p>
          <Link to="/register" className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-2 group">
            Create Your Account Now
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;