import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoctorSearch from './pages/DoctorSearch';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import PendingDoctors from './components/admin/PendingDoctors';
import UsersList from './components/admin/UsersList';
import AllAppointments from './components/admin/AllAppointments';

// Doctor Components
import DoctorDashboard from './components/doctor/DoctorDashboard';
import DoctorAvailability from './components/doctor/DoctorAvailability';
import DoctorAppointments from './components/doctor/DoctorAppointments';
import MedicalRecordForm from './components/doctor/MedicalRecordForm';
import DoctorProfileView from './pages/DoctorProfileView';  // ✅ Import

// Pet Owner Components
import OwnerDashboard from './components/owner/OwnerDashboard';
import PetList from './components/owner/PetList';
import AddPet from './components/owner/AddPet';
import EditPet from './components/owner/EditPet';
import BookAppointment from './components/owner/BookAppointment';
import AppointmentsList from './components/owner/AppointmentsList';
import MedicalRecords from './components/owner/MedicalRecords';
import VaccinationsList from './components/owner/VaccinationsList';
import PrescriptionsList from './components/owner/PrescriptionsList';
import PetProfile from './components/owner/PetProfile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-ink-50">
          <Navbar />
          <main className="page-container py-6 sm:py-8 flex-1 w-full animate-fadeIn">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Dashboard */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              {/* Search */}
              <Route path="/search-doctors" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <DoctorSearch />
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/admin/pending-doctors" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <PendingDoctors />
                </PrivateRoute>
              } />
              <Route path="/admin/users" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <UsersList />
                </PrivateRoute>
              } />
              <Route path="/admin/appointments" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AllAppointments />
                </PrivateRoute>
              } />
              
              {/* ========== DOCTOR ROUTES ========== */}
              <Route path="/doctor/dashboard" element={
                <PrivateRoute allowedRoles={['DOCTOR']}>
                  <DoctorDashboard />
                </PrivateRoute>
              } />
              <Route path="/doctor/availability" element={
                <PrivateRoute allowedRoles={['DOCTOR']}>
                  <DoctorAvailability />
                </PrivateRoute>
              } />
              <Route path="/doctor/appointments" element={
                <PrivateRoute allowedRoles={['DOCTOR']}>
                  <DoctorAppointments />
                </PrivateRoute>
              } />
              <Route path="/doctor/medical-record" element={
                <PrivateRoute allowedRoles={['DOCTOR']}>
                  <MedicalRecordForm />
                </PrivateRoute>
              } />
              
              {/* ✅ DOCTOR PROFILE ROUTE - මෙතනට ගෙනියන්න! */}
              <Route path="/doctor/profile" element={
                <PrivateRoute allowedRoles={['DOCTOR']}>
                  <DoctorProfileView />
                </PrivateRoute>
              } />
              
              {/* ========== PET OWNER ROUTES ========== */}
              <Route path="/owner/dashboard" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <OwnerDashboard />
                </PrivateRoute>
              } />
              <Route path="/owner/pets" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <PetList />
                </PrivateRoute>
              } />
              <Route path="/owner/pets/add" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <AddPet />
                </PrivateRoute>
              } />
              <Route path="/owner/pets/edit/:id" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <EditPet />
                </PrivateRoute>
              } />
              <Route path="/owner/pets/:petId" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <PetProfile />
                </PrivateRoute>
              } />
              <Route path="/owner/appointments" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <AppointmentsList />
                </PrivateRoute>
              } />
              <Route path="/owner/appointments/book" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <BookAppointment />
                </PrivateRoute>
              } />
              <Route path="/owner/medical-records/:petId" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <MedicalRecords />
                </PrivateRoute>
              } />
              <Route path="/owner/vaccinations/:petId" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <VaccinationsList />
                </PrivateRoute>
              } />
              <Route path="/owner/prescriptions/:petId" element={
                <PrivateRoute allowedRoles={['PET_OWNER']}>
                  <PrescriptionsList />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;