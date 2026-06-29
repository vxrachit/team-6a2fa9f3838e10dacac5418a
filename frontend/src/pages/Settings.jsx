import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updatePreferences, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [preferences, setPreferences] = useState({
    theme: 'system',
    explainMode: 'intermediate',
    notifications: true
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.error('Please fill in both fields');
    setIsLoading(true);
    try {
      await api.patch('/users/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setIsChangingPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to withdraw from the internship and permanently delete your account? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await api.delete('/users/withdraw');
        toast.success('Account permanently deleted');
        logout();
        navigate('/login');
      } catch (err) {
        toast.error('Failed to delete account');
        setIsLoading(false);
      }
    }
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const handlePreferenceChange = async (key, value) => {
    setIsLoading(true);
    try {
      const updatedPrefs = { ...preferences, [key]: value };
      await updatePreferences(updatedPrefs);
      setPreferences(updatedPrefs);
      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">Settings</h1>
          <p className="text-slate-400">Customize your experience</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Appearance */}
          <div className="card-dark p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Appearance</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">Dark Mode</h3>
                  <p className="text-sm text-slate-400 mt-1">Toggle between light and dark themes</p>
                </div>
                <button
                  onClick={toggleTheme}
                  disabled={isLoading}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    isDark ? 'bg-purple-600' : 'bg-slate-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      isDark ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Theme Preference</h3>
                <div className="space-y-3">
                  {[
                    { value: 'light', label: '☀️ Light', desc: 'Light theme for bright environments' },
                    { value: 'dark', label: '🌙 Dark', desc: 'Dark theme for comfortable viewing' },
                    { value: 'system', label: '🖥️ System', desc: 'Follow system preferences' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-4 p-3 bg-dark-600/50 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                      <input
                        type="radio"
                        name="theme"
                        value={option.value}
                        checked={preferences.theme === option.value}
                        onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                        disabled={isLoading}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="text-slate-200 font-medium">{option.label}</p>
                        <p className="text-xs text-slate-400">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Interaction */}
          <div className="card-dark p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6">AI Interaction</h2>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Explanation Level</h3>
              <p className="text-sm text-slate-400 mb-4">Choose how detailed AI explanations should be</p>
              <div className="space-y-3">
                {[
                  { value: 'beginner', label: '👶 Beginner', desc: 'Simple explanations for basics' },
                  { value: 'intermediate', label: '📚 Intermediate', desc: 'Balanced explanations (Recommended)' },
                  { value: 'detailed', label: '🧑‍🎓 Detailed', desc: 'In-depth technical explanations' }
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-4 p-3 bg-dark-600/50 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                    <input
                      type="radio"
                      name="explainMode"
                      value={option.value}
                      checked={preferences.explainMode === option.value}
                      onChange={(e) => handlePreferenceChange('explainMode', e.target.value)}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-slate-200 font-medium">{option.label}</p>
                      <p className="text-xs text-slate-400">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card-dark p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">Enable Notifications</h3>
                  <p className="text-sm text-slate-400 mt-1">Get alerts for important updates and messages</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('notifications', !preferences.notifications)}
                  disabled={isLoading}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    preferences.notifications ? 'bg-purple-600' : 'bg-slate-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.notifications ? 'translate-x-1' : 'translate-x-7'
                    }`}
                  />
                </button>
              </div>

              {preferences.notifications && (
                <div className="bg-dark-600/50 rounded-lg p-4 text-sm text-slate-300">
                  <p className="mb-2 font-medium">You'll receive notifications for:</p>
                  <ul className="space-y-1 text-xs">
                    <li>✓ Answers to your queries</li>
                    <li>✓ Mentions and comments</li>
                    <li>✓ Important announcements</li>
                    <li>✓ Activity updates</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="card-dark p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Privacy & Security</h2>
            
            <div className="space-y-4">
              <div className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">Change Password</h3>
                    <p className="text-sm text-slate-400 mt-1">Update your account password regularly</p>
                  </div>
                  <button onClick={() => setIsChangingPassword(!isChangingPassword)} className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-slate-200 rounded-lg transition-colors">
                    {isChangingPassword ? 'Cancel' : 'Change'}
                  </button>
                </div>
                
                {isChangingPassword && (
                  <form onSubmit={handleChangePassword} className="space-y-4 mt-4 bg-dark-600/30 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Current Password</label>
                      <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-dark-700 border border-slate-600 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">New Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-dark-700 border border-slate-600 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50">
                      Save Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card-dark p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Account</h2>
            
            <div className="space-y-3">
              <button onClick={handleDeleteAccount} disabled={isLoading} className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-left font-medium disabled:opacity-50">
                ⚠️ Withdraw from internship and permanently delete your account
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 Your preferences are saved automatically and synced across all your devices.
          </p>
        </div>
      </div>
    </div>
  );
}
