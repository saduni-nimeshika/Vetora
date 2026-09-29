import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { FaUsers, FaUserShield, FaStethoscope, FaPaw } from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const roleMeta = {
  ADMIN: { label: 'Admins', icon: <FaUserShield />, badge: 'badge bg-purple-100 text-purple-700', stat: 'bg-purple-100 text-purple-600' },
  DOCTOR: { label: 'Doctors', icon: <FaStethoscope />, badge: 'badge-success', stat: 'bg-emerald-100 text-emerald-600' },
  PET_OWNER: { label: 'Pet Owners', icon: <FaPaw />, badge: 'badge-info', stat: 'bg-blue-100 text-blue-600' },
};
const roleFilters = ['ALL', 'ADMIN', 'DOCTOR', 'PET_OWNER'];

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/admin/users');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const c = { ALL: users.length, ADMIN: 0, DOCTOR: 0, PET_OWNER: 0 };
    users.forEach((u) => { if (c[u.role] !== undefined) c[u.role] += 1; });
    return c;
  }, [users]);

  const filteredUsers = useMemo(
    () => (roleFilter === 'ALL' ? users : users.filter((u) => u.role === roleFilter)),
    [users, roleFilter]
  );

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
        <h1 className="page-title">
          <FaUsers className="text-primary-600" /> All Users ({users.length})
        </h1>
      </motion.div>

      {/* Users split by role, up top */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {['ADMIN', 'DOCTOR', 'PET_OWNER'].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(roleFilter === role ? 'ALL' : role)}
            className={`stat-card text-left transition-all ${roleFilter === role ? 'ring-2 ring-primary-500' : ''}`}
          >
            <span className={`stat-icon ${roleMeta[role].stat}`}>{roleMeta[role].icon}</span>
            <div>
              <p className="stat-value">{counts[role]}</p>
              <p className="stat-label">{roleMeta[role].label}</p>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Role filter tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-5">
        {roleFilters.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              roleFilter === r
                ? 'bg-primary-600 text-white shadow-soft'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            {r === 'ALL' ? 'All' : roleMeta[r].label}
            <span className="ml-1 opacity-70">({counts[r]})</span>
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="card !p-0 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <p className="text-ink-400 text-center py-10">No users in this category</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">#</th>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Email</th>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Role</th>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, index) => (
                  <tr key={u.id} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="p-3 text-ink-400">{index + 1}</td>
                    <td className="p-3 font-semibold text-ink-800">{u.name}</td>
                    <td className="p-3 text-ink-600">{u.email}</td>
                    <td className="p-3">
                      <span className={`${roleMeta[u.role]?.badge || 'badge-neutral'} w-fit`}>
                        {roleMeta[u.role]?.icon}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={u.enabled ? 'badge-success' : 'badge-danger'}>
                        {u.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UsersList;
