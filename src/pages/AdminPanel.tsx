import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Role } from '../lib/database.types';
import {
  FiUser,
  FiUserPlus,
  FiEdit,
  FiTrash2,
  FiShield,
  FiUsers,
} from 'react-icons/fi';

interface UserWithRole extends User {
  roles?: {
    id: number;
    name: string;
    description: string | null;
  };
}

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role_id: 2, // contributor by default
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchRoles();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          *,
          roles (
            id,
            name,
            description
          )
        `,
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'TempPass123!', // Temporary password
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          role_id: formData.role_id,
        });

        if (profileError) throw profileError;

        setShowAddUser(false);
        setFormData({ email: '', full_name: '', role_id: 2 });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      alert(
        'Erreur lors de l&apos;ajout de l&apos;utilisateur: ' + error.message,
      );
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          role_id: formData.role_id,
          is_active: editingUser.is_active,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      setEditingUser(null);
      setFormData({ email: '', full_name: '', role_id: 2 });
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert('Erreur lors de la mise à jour: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?'))
      return;

    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  const startEdit = (user: UserWithRole) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      role_id: user.role_id,
    });
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center">
          <FiShield className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">
            Accès refusé
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            Vous n&apos;avez pas les permissions pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <FiUsers className="h-6 w-6" />
          Gestion des Utilisateurs
        </h1>
        <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
          Gérez les utilisateurs et leurs rôles dans l&apos;application.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowAddUser(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FiUserPlus className="h-4 w-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-secondary-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">
              Ajouter un utilisateur
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Rôle
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role_id: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-secondary-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">
              Modifier l&apos;utilisateur
            </h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md shadow-sm bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Rôle
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role_id: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-secondary-900 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-secondary-200 dark:divide-secondary-700">
          {users.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiUser className="h-8 w-8 text-secondary-400" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">
                      {user.full_name || 'Sans nom'}
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.roles?.name === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.roles?.name || 'unknown'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(user)}
                      className="text-secondary-400 hover:text-secondary-600"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    {user.id !== user?.id && ( // Don't allow deleting self
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
