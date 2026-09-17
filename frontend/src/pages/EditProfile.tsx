import React, { useState, useEffect } from 'react';
import { 
  updateProfile, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  RecaptchaVerifier,
  PhoneAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { Loader2, User, Phone as PhoneIcon, Lock, Camera, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserAPI } from '../api';
import { useNavigate } from 'react-router-dom';

export function EditProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
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
    if (currentUser) {
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
    } else {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      let photoURL = currentUser.photoURL;

      if (profilePic) {
        const formData = new FormData();
        formData.append('file', profilePic);
        formData.append('upload_preset', 'sentix_profile');

        const uploadRes = await fetch('https://api.cloudinary.com/v1_1/sdjfcac4/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image to Cloudinary');
        }

        const data = await uploadRes.json();
        photoURL = data.secure_url;
      }

      await updateProfile(currentUser, {
        displayName: displayName.trim(),
        photoURL
      });

      await UserAPI.updateUserProfile({
        name: displayName.trim(),
        gender: gender || undefined,
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
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
      setTimeout(() => setSuccessMsg(''), 3000);
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
      
      await UserAPI.updateUserProfile({ phone: phoneNumber });
      
      setSuccessMsg('Phone number linked successfully!');
      setShowOtpInput(false);
      setTimeout(() => setSuccessMsg(''), 3000);
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
      if (!isEmailProvider) {
        await UserAPI.updateUserProfile({ email: email.trim() });
        setSuccessMsg('Email updated successfully!');
      } else {
        setSuccessMsg('Contact info saved.');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
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
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
            <p className="text-sentix-text mt-1">Manage your profile, contact details, and security.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm font-bold text-sentix-text bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Global Notifications */}
        {(error || successMsg) && (
          <div className="sticky top-4 z-50">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <p className="text-sm text-green-700 font-medium">{successMsg}</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-sentix-cyan" /> 
              Public Profile
            </h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-sentix-cyan text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-cyan-600 transition-colors transform group-hover:scale-110">
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

                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sentix-cyan/50 focus:border-sentix-cyan transition-all"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Gender</label>
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sentix-cyan/50 focus:border-sentix-cyan transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gray-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[150px]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-sentix-cyan" /> 
              Contact Information
            </h3>
            
            <form onSubmit={handleContactUpdate} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEmailProvider}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sentix-cyan/50 focus:border-sentix-cyan transition-all disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
                {isEmailProvider && <p className="text-xs text-gray-500 mt-2 font-medium">Your email is managed by your sign-in provider and cannot be changed here.</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={showOtpInput}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sentix-cyan/50 focus:border-sentix-cyan transition-all disabled:opacity-60 disabled:bg-gray-100"
                    placeholder="+91 98765 43210"
                  />
                  {!showOtpInput && (
                    <button 
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || !phoneNumber || phoneNumber === dbUser?.phone}
                      className="bg-gray-100 text-gray-700 px-6 py-3.5 rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>

              {showOtpInput && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                  <label className="block text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Verification Code</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="flex-1 bg-white border border-blue-200 rounded-lg p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="123456"
                    />
                    <button 
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={loading || !verificationCode}
                      className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Code'}
                    </button>
                  </div>
                </div>
              )}
              
              <div id="recaptcha-container"></div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gray-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[150px]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Contact Info'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sentix-cyan" /> 
              Security Settings
            </h3>
            
            <form onSubmit={handleSecurityUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sentix-cyan/50 focus:border-sentix-cyan transition-all"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sentix-cyan/50 focus:border-sentix-cyan transition-all"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sentix-cyan/50 focus:border-sentix-cyan transition-all"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gray-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[150px]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
