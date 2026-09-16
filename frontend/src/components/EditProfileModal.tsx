import React, { useState, useEffect, useRef } from 'react';
import { 
  updateProfile, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  RecaptchaVerifier,
  PhoneAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../config/firebase';
import { X, Loader2, User, Phone as PhoneIcon, Lock, Camera, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserAPI } from '../api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Profile Data
  const [dbUser, setDbUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Contact Data
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Security Data
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isEmailProvider = currentUser?.providerData.some(p => p.providerId === 'password' || p.providerId === 'google.com');

  useEffect(() => {
    if (isOpen && currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPreviewUrl(currentUser.photoURL || '');
      
      // Fetch extra details from backend
      UserAPI.getCurrentUser().then(data => {
        setDbUser(data);
        setGender(data.gender || '');
        setEmail(data.email || currentUser.email || '');
        setPhoneNumber(data.phone || '');
      }).catch(err => {
        console.error("Failed to load user profile", err);
      });
      
      setError('');
      setSuccessMsg('');
      setActiveTab('profile');
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      let photoURL = currentUser.photoURL;

      // Upload new picture if selected
      if (profilePic) {
        const fileRef = ref(storage, `profile_pics/${currentUser.uid}/${profilePic.name}`);
        await uploadBytes(fileRef, profilePic);
        photoURL = await getDownloadURL(fileRef);
      }

      // Update Firebase Auth Profile
      await updateProfile(currentUser, {
        displayName: displayName.trim(),
        photoURL
      });

      // Update Backend Database
      await UserAPI.updateUserProfile({
        name: displayName.trim(),
        gender: gender || null,
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) return setError("Please enter a phone number");
    setLoading(true);
    setError('');
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(phoneNumber, appVerifier);
      setVerificationId(verificationId);
      setShowOtpInput(true);
      setSuccessMsg('OTP sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationCode) return setError("Please enter the code");
    setLoading(true);
    setError('');
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await linkWithCredential(currentUser, credential);
      
      // Sync to backend
      await UserAPI.updateUserProfile({ phone: phoneNumber });
      
      setSuccessMsg('Phone number linked successfully!');
      setShowOtpInput(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleContactUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      // Just updating email in backend if allowed
      if (!isEmailProvider) {
        await UserAPI.updateUserProfile({ email: email.trim() });
        setSuccessMsg('Email updated successfully!');
      } else {
        setSuccessMsg('Contact info saved.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update contact info');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError("Passwords don't match");
    }
    
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (!currentUser.email) throw new Error("No email linked to account");
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      await updatePassword(currentUser, newPassword);
      setSuccessMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const renderTab = () => {
    if (activeTab === 'profile') {
      return (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#14181c] border border-white/10 overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-sentix-text" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-sentix-cyan text-sentix-bg p-2 rounded-full cursor-pointer hover:bg-white transition-colors">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProfilePic(e.target.files[0]);
                      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-sentix-text uppercase tracking-widest mb-1">Display Name</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#14181c] border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-sentix-cyan transition-colors"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sentix-text uppercase tracking-widest mb-1">Gender</label>
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-[#14181c] border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-sentix-cyan transition-colors"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-sentix-cyan text-sentix-bg font-black uppercase tracking-wider py-3 rounded-md hover:bg-white transition-colors mt-4 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile'}
          </button>
        </form>
      );
    }

    if (activeTab === 'contact') {
      return (
        <form onSubmit={handleContactUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-sentix-text uppercase tracking-widest mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEmailProvider}
              className="w-full bg-[#14181c] border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-sentix-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
            {isEmailProvider && <p className="text-xs text-sentix-text mt-1">Email cannot be changed.</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-sentix-text uppercase tracking-widest mb-1">Phone Number (With Country Code)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={showOtpInput}
                className="flex-1 bg-[#14181c] border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-sentix-cyan transition-colors disabled:opacity-50"
                placeholder="+1 234 567 8900"
              />
              {!showOtpInput && (
                <button 
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || !phoneNumber || phoneNumber === dbUser?.phone}
                  className="bg-sentix-cyan text-sentix-bg px-4 rounded-md font-bold uppercase disabled:opacity-50 hover:bg-white transition-colors flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                </button>
              )}
            </div>
          </div>

          {showOtpInput && (
            <div>
              <label className="block text-xs font-bold text-sentix-text uppercase tracking-widest mb-1">Verification Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="flex-1 bg-[#14181c] border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-sentix-cyan transition-colors"
                  placeholder="123456"
                />
                <button 
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || !verificationCode}
                  className="bg-sentix-cyan text-sentix-bg px-4 rounded-md font-bold uppercase disabled:opacity-50 hover:bg-white transition-colors flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                </button>
              </div>
            </div>
          )}
          
          <div id="recaptcha-container"></div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-sentix-cyan text-sentix-bg font-black uppercase tracking-wider py-3 rounded-md hover:bg-white transition-colors mt-4 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Contact Info'}
          </button>
        </form>
      );
    }

    if (activeTab === 'security') {
      return (
        <form onSubmit={handleSecurityUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-sentix-text uppercase tracking-widest mb-1">Current Password</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#14181c] border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-sentix-cyan transition-colors"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sentix-text uppercase tracking-widest mb-1">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#14181c] border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-sentix-cyan transition-colors"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sentix-text uppercase tracking-widest mb-1">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#14181c] border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-sentix-cyan transition-colors"
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-sentix-cyan text-sentix-bg font-black uppercase tracking-wider py-3 rounded-md hover:bg-white transition-colors mt-4 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1e2329] rounded-xl border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-1/3 bg-[#14181c] border-r border-white/10 p-4 md:p-6 flex flex-col gap-2">
          <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tight">Settings</h2>
          
          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-bold uppercase tracking-wider ${activeTab === 'profile' ? 'bg-sentix-cyan/10 text-sentix-cyan' : 'text-sentix-text hover:bg-white/5 hover:text-white'}`}
          >
            <User className="w-4 h-4" /> Profile
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-bold uppercase tracking-wider ${activeTab === 'contact' ? 'bg-sentix-cyan/10 text-sentix-cyan' : 'text-sentix-text hover:bg-white/5 hover:text-white'}`}
          >
            <PhoneIcon className="w-4 h-4" /> Contact
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-bold uppercase tracking-wider ${activeTab === 'security' ? 'bg-sentix-cyan/10 text-sentix-cyan' : 'text-sentix-text hover:bg-white/5 hover:text-white'}`}
          >
            <Lock className="w-4 h-4" /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-2/3 p-6 md:p-8 relative min-h-[400px]">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-sentix-text hover:text-white transition-colors bg-[#14181c] p-2 rounded-full border border-white/10 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">
            {activeTab === 'profile' && 'Edit Profile'}
            {activeTab === 'contact' && 'Contact Info'}
            {activeTab === 'security' && 'Security'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm mb-6">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-sentix-cyan/10 border border-sentix-cyan/50 text-sentix-cyan p-3 rounded text-sm mb-6">
              {successMsg}
            </div>
          )}

          {renderTab()}
        </div>
      </div>
    </div>
  );
}
