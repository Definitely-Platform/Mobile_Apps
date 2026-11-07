import React from 'react';
import { AuthCallbackHandler } from '@definitely/mobile-auth';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallbackScreen() {
  return (
    <AuthCallbackHandler
      useAuthStore={useAuthStore}
      brandName="{{APP_NAME}}"
      homePath="/"
    />
  );
}
