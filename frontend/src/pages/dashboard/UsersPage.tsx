import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { getUsersApi, createUserApi } from '../../api/endpoints';
import { TextInput, SelectInput } from '../../components/common/TextInput';
import { Button } from '../../components/common/Button';
import { BadgePill } from '../../components/common/BadgePill';
import { UserPlus, Shield, Check, Users, Mail, Building } from 'lucide-react';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Admin (Full Access)', value: 'admin' },
  { label: 'Control Room Dispatcher', value: 'control_room' },
  { label: 'Department Officer', value: 'department_officer' },
  { label: 'Field Team Worker', value: 'field_team' },
];

const DEPARTMENT_OPTIONS = [
  { label: 'Executive Administration', value: 'Executive Administration' },
  { label: 'Central Dispatch Command', value: 'Central Dispatch Command' },
  { label: 'Roads & Infrastructure', value: 'Roads & Infrastructure' },
  { label: 'Water & Sanitation', value: 'Water & Sanitation' },
  { label: 'Electrical & Lighting', value: 'Electrical & Lighting' },
  { label: 'Disaster Management', value: 'Disaster Management' },
];

import { useAuth } from '../../context/AuthContext';
import { guestStore } from '../../api/seedData';

export const UsersPage: React.FC = () => {
  const { isGuestMode } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('department_officer');
  const [department, setDepartment] = useState('Roads & Infrastructure');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setError(null);
    try {
      if (isGuestMode) {
        setUsers(guestStore.users);
      } else {
        const data = await getUsersApi();
        setUsers(data);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load users from backend.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [isGuestMode]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    setError(null);
    try {
      let created: User;
      if (isGuestMode) {
        created = guestStore.createUser({
          name,
          email,
          role,
          department,
        });
      } else {
        created = await createUserApi({
          name,
          email,
          role,
          department,
        });
      }
      setUsers([created, ...users]);
      setName('');
      setEmail('');
      const note = isGuestMode
        ? `Provisioned staff account for ${created.name} (${created.email}). (Demo — changes aren't saved)`
        : `Provisioned staff account for ${created.name} (${created.email}).`;
      setSuccessMsg(note);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="type-title-lg text-ink font-semibold">User Account & Role Provisioning</h1>
          <BadgePill label="ADMIN ONLY" variant="dark" />
        </div>
        <p className="type-body-sm text-muted mt-1">
          Create, manage, and assign access permissions to municipal command staff and field responders
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-semantic-up/10 border border-semantic-up/30 rounded-lg text-semantic-up text-[14px] font-medium flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-semantic-down/10 border border-semantic-down/30 rounded-lg text-semantic-down text-[14px] font-medium flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}


      {/* Two Column Layout: Create Form Left, Existing Users Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Form (4 cols) */}
        <div className="lg:col-span-4 bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-hairline">
            <UserPlus className="w-5 h-5 text-primary" />
            <h3 className="type-title-md text-ink">New Staff Account</h3>
          </div>

          <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
            <TextInput
              label="Full Name"
              placeholder="e.g. Officer Nathan Drake"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextInput
              label="Official Email"
              type="email"
              placeholder="nathan.drake@civicguard.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <SelectInput
              label="Assigned Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={ROLE_OPTIONS}
            />

            <SelectInput
              label="Department / Unit"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={DEPARTMENT_OPTIONS}
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full mt-2 h-11 text-[14px]"
            >
              {isSubmitting ? 'Creating Account...' : 'Provision Staff Account'}
            </Button>
          </form>
        </div>

        {/* Existing Accounts Table (8 cols) */}
        <div className="lg:col-span-8 bg-canvas border border-hairline rounded-xl overflow-hidden shadow-soft">
          <div className="bg-surface-soft px-6 py-4 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted" />
              <span className="font-semibold text-ink text-[14px]">Active Staff Directory</span>
            </div>
            <span className="font-mono text-[12px] text-muted">{users.length} accounts</span>
          </div>

          <div className="divide-y divide-hairline">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-soft/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink text-[15px]">{u.name}</span>
                    <BadgePill role={u.role} label={u.role.replace('_', ' ')} className="text-[10px]" />
                  </div>
                  <div className="flex items-center gap-4 text-muted text-[13px] mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Mail className="w-3.5 h-3.5" />
                      {u.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      {u.department}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-muted block">ID: {u.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
