import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaPaw, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const PetList = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/owner/pets');
      setPets(res.data?.pets || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) return;
    try {
      await api.delete(`/api/v1/owner/pets/${petId}`);
      setPets(pets.filter(p => p.id !== petId));
      alert('✅ Pet deleted successfully!');
    } catch (error) {
      alert('❌ Failed to delete pet');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaPaw className="text-emerald-600" />
          My Pets
        </h1>
        <Link to="/owner/pets/add" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
          <FaPlus /> Add Pet
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FaPaw className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No pets found</p>
          <Link to="/owner/pets/add" className="text-emerald-600 hover:underline mt-2 inline-block">
            Add your first pet
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{pet.name}</h3>
                  <p className="text-sm text-gray-600">{pet.species} • {pet.breed || 'Unknown breed'}</p>
                  <p className="text-sm text-gray-500">{pet.gender} • {pet.age || 'N/A'}</p>
                  {pet.weight && <p className="text-sm text-gray-500">{pet.weight} kg</p>}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${pet.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {pet.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/owner/pets/${pet.id}`} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                  <FaEye />
                </Link>
                <Link to={`/owner/pets/edit/${pet.id}`} className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition">
                  <FaEdit />
                </Link>
                <button onClick={() => handleDelete(pet.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetList;