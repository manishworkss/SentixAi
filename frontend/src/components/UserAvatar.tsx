import React, { useState } from 'react';
import md5 from 'md5';

interface UserAvatarProps {
  user: any; // Firebase user object
  size?: number;
  className?: string;
}

export function UserAvatar({ user, size = 40, className = '' }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Determine fallback name - default to 'User' if no text name exists
  const fallbackName = user?.displayName || user?.email?.split('@')[0] || 'User';
  
  // UI Avatars URL
  const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&color=fff&size=${size * 2}`;

  let avatarUrl = uiAvatarUrl;

  // Use Firebase photo URL if available
  if (user?.photoURL && !imageError) {
    avatarUrl = user.photoURL;
  } 
  // Otherwise try Gravatar if email exists
  else if (user?.email && !imageError) {
    const hash = md5(user.email.trim().toLowerCase());
    // Fallback to ui-avatar if gravatar not found
    avatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size * 2}&d=${encodeURIComponent(uiAvatarUrl)}`;
  }

  return (
    <img
      src={avatarUrl}
      alt={`${fallbackName}'s avatar`}
      className={`rounded-full object-cover border border-sentix-border shadow-sm ${className}`}
      style={{ width: size, height: size }}
      onError={() => setImageError(true)} // Fallback gracefully if any image load fails
      referrerPolicy="no-referrer"
    />
  );
}
