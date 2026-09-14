// Authentication configuration for PetCare
// This file preserves the auth structure for future backend integration

export const authConfig = {
    routes: {
      login: '/login',
      register: '/register',
      forgotPassword: '/forgot-password',
    },
    validation: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
      },
      phone: /^(\+84|0)[0-9]{9}$/,
    },
  }
  