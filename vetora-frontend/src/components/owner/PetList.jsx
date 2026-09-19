import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaPaw, FaPlus, FaEdit, FaTrash, FaEye, FaVenusMars, FaWeight, FaBirthdayCake } from 'react-icons/fa';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const speciesEmoji = { DOG: '🐕', CAT: '🐈', BIRD: '🐦', RABBIT: '🐰' };

const PetList = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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
      toast.error('Failed to load your pets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet? This cannot be undone.')) return;
    setDeletingId(petId);
    try {
      await api.delete(`/api/v1/owner/pets/${petId}`);
      setPets(pets.filter((p) => p.id !== petId));
      toast.success('Pet deleted successfully');
    } catch (error) {
      toast.error('Failed to delete pet');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="text-2xl font-extrabold text-ink-900 font-display flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <FaPaw />
          </span>
          My Pets
        </h1>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link to="/owner/pets/add" className="btn-primary">
            <FaPlus /> Add Pet
          </Link>
        </motion.div>
      </motion.div>

      {pets.length === 0 ? (
        <motion.div variants={itemVariants} className="empty-state">
          <FaPaw className="text-5xl text-ink-300 mb-3" />
          <p className="text-ink-500 mb-4">No pets added yet</p>
          <Link to="/owner/pets/add" className="btn-primary">
            <FaPlus /> Add Your First Pet
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {pets.map((pet) => (
              <motion.div
                key={pet.id}
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                whileHover={{ y: -4 }}
                className="card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-14 h-14 rounded-2xl overflow-hidden bg-primary-50 flex items-center justify-center text-2xl shrink-0">
                      {pet.profileImage ? (
                        <img src={pet.profileImage} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        speciesEmoji[pet.species?.toUpperCase()] || '🐾'
                      )}
                    </span>
                    <div>
                      <h3 className="font-bold text-ink-900 font-display">{pet.name}</h3>
                      <p className="text-xs text-ink-400">{pet.species} • {pet.breed || 'Unknown breed'}</p>
                    </div>
                  </div>
                  <span className={pet.isActive ? 'badge-success' : 'badge-danger'}>
                    {pet.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-500 mb-4 pb-4 border-b border-ink-100">
                  <span className="flex items-center gap-1"><FaVenusMars className="text-primary-400" /> {pet.gender || 'N/A'}</span>
                  <span className="flex items-center gap-1"><FaBirthdayCake className="text-primary-400" /> {pet.age || 'N/A'}</span>
                  {pet.weight && (
                    <span className="flex items-center gap-1"><FaWeight className="text-primary-400" /> {pet.weight} kg</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/owner/pets/${pet.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-semibold"
                  >
                    <FaEye className="text-xs" /> View
                  </Link>
                  <Link
                    to={`/owner/pets/edit/${pet.id}`}
                    className="p-2.5 bg-ink-100 text-ink-600 rounded-lg hover:bg-ink-200 transition-colors"
                    title="Edit"
                  >
                    <FaEdit className="text-sm" />
                  </Link>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    disabled={deletingId === pet.id}
                    className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PetList;
