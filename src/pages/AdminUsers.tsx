import { useState, useEffect, type FormEvent } from 'react';
import { adminService } from '../services/admin.service';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { isValidEmail, isNotEmpty } from '../utils/validators';
import toast from 'react-hot-toast';
import type { IUser } from '../types';
import { Trash2, Plus, UserPlus } from 'lucide-react';

const AdminUsers = () => {
  const [admins, setAdmins] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdmins();
      setAdmins(data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!isNotEmpty(name) || !isNotEmpty(email) || !isNotEmpty(password)) {
      toast.error('All fields are required');
      return;
    }
    if (!isValidEmail(email)) {
      toast.error('Invalid email format');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setFormLoading(true);
    try {
      await adminService.createAdmin({ name, email, password });
      toast.success('Admin added successfully!');
      setIsAdding(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add admin');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this administrator?')) {
      try {
        await adminService.deleteAdmin(id);
        toast.success('Admin deleted successfully');
        setAdmins(admins.filter((a) => a._id !== id));
      } catch (error) {
        toast.error('Failed to delete admin');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Team Management</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage platform administrators and permissions.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="primary" className="flex items-center gap-2">
            <Plus size={18} />
            Add Admin
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-[var(--color-bg-elevated)] p-6 rounded-xl border border-[var(--color-border)] animate-fade-in">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)] flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Add New Administrator</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Create credentials for a new team member.</p>
            </div>
          </div>

          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Input
              label="Initial Password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={formLoading}>
                Create Admin
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-hover)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Administrator</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-[var(--color-text-tertiary)]">
                    Loading team members...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-[var(--color-text-tertiary)]">
                    No other administrators found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-[var(--color-bg-hover)]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-500)]/20 text-[var(--color-primary-400)] flex items-center justify-center font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">{admin.name}</p>
                          <p className="text-xs text-[var(--color-text-tertiary)]">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-accent-500)]/10 text-[var(--color-accent-400)] border border-[var(--color-accent-500)]/20">
                        Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(admin._id)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Delete Admin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
