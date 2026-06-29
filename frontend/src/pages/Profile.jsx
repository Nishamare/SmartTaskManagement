import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { Avatar, Spinner } from '../components/UI';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio:  user?.bio  || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Validate Profile ──────────────────
  const validateProfile = () => {
    const errs = {};
    if (!profileForm.name.trim())
      errs.name = 'Name is required';
    else if (profileForm.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters';
    if (profileForm.bio.length > 500)
      errs.bio = 'Bio must be under 500 characters';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Validate Password ─────────────────
  const validatePassword = () => {
    const errs = {};
    if (!passwordForm.currentPassword)
      errs.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword)
      errs.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6)
      errs.newPassword = 'Password must be at least 6 characters';
    if (!passwordForm.confirmPassword)
      errs.confirmPassword = 'Please confirm your new password';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save Profile ──────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save Password ─────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setSavingPassword(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword:     '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Profile Card */}
      <div className="card p-6 mb-6">

        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-6 pb-6
                        border-b border-gray-100 dark:border-gray-800">
          <Avatar
            name={user?.name}
            avatar={user?.avatar}
            size="xl"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge bg-indigo-100 text-indigo-700
                               dark:bg-indigo-900 dark:text-indigo-300 capitalize">
                {user?.role}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Member since {formatDate(user?.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Personal Information
          </h3>

          {/* Name */}
          <div>
            <label className="label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => {
                setProfileForm({ ...profileForm, name: e.target.value });
                setProfileErrors({ ...profileErrors, name: '' });
              }}
              placeholder="Your full name"
              className={`input ${profileErrors.name ? 'border-red-500' : ''}`}
            />
            {profileErrors.name && (
              <p className="mt-1 text-xs text-red-500">{profileErrors.name}</p>
            )}
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="input opacity-60 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Email cannot be changed
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="label">Bio</label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => {
                setProfileForm({ ...profileForm, bio: e.target.value });
                setProfileErrors({ ...profileErrors, bio: '' });
              }}
              placeholder="Tell your team a little about yourself..."
              rows={4}
              className={`input resize-none ${profileErrors.bio ? 'border-red-500' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {profileErrors.bio
                ? <p className="text-xs text-red-500">{profileErrors.bio}</p>
                : <span />
              }
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {profileForm.bio.length}/500
              </p>
            </div>
          </div>

          {/* Save Profile */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary"
            >
              {savingProfile
                ? <><Spinner size="sm" /> Saving...</>
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          🔐 Change Password
        </h3>

        <form onSubmit={handleSavePassword} className="space-y-4">

          {/* Current Password */}
          <div>
            <label className="label">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => {
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                setPasswordErrors({ ...passwordErrors, currentPassword: '' });
              }}
              placeholder="Enter current password"
              className={`input ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">
                {passwordErrors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="label">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => {
                setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                setPasswordErrors({ ...passwordErrors, newPassword: '' });
              }}
              placeholder="Min. 6 characters"
              className={`input ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-xs text-red-500">
                {passwordErrors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => {
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
              }}
              placeholder="Repeat new password"
              className={`input ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Save Password */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary"
            >
              {savingPassword
                ? <><Spinner size="sm" /> Changing...</>
                : 'Change Password'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}