import test from 'node:test';
import assert from 'node:assert/strict';
import { getSafeRedirectPath } from './navigationUtils.js';
import uiReducer, {
  openAuthModal,
  closeAuthModal,
  setAuthModalMode,
  setAuthModalVerificationEmail,
} from '../store/slices/uiSlice.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from '../schemas/auth.schema.js';

test('getSafeRedirectPath correctly secures application navigation', () => {
  // Rejects open redirect attempts
  assert.equal(getSafeRedirectPath('https://malicious.example.com'), '/');
  assert.equal(getSafeRedirectPath('http://malicious.example.com'), '/');
  assert.equal(getSafeRedirectPath('//malicious.example.com'), '/');
  assert.equal(getSafeRedirectPath('javascript:alert(1)'), '/');
  assert.equal(getSafeRedirectPath(null), '/');
  assert.equal(getSafeRedirectPath(''), '/');

  // Rejects auth redirect loops
  assert.equal(getSafeRedirectPath('/login'), '/');
  assert.equal(getSafeRedirectPath('/register'), '/');
  assert.equal(getSafeRedirectPath('/forgot-password'), '/');
  assert.equal(getSafeRedirectPath('/verify-email'), '/');
  assert.equal(getSafeRedirectPath('/login?returnUrl=/post-property'), '/');

  // Allows valid internal application routes
  assert.equal(getSafeRedirectPath('/properties'), '/properties');
  assert.equal(getSafeRedirectPath('/properties/gg-cbe-plot-01'), '/properties/gg-cbe-plot-01');
  assert.equal(getSafeRedirectPath('/post-property'), '/post-property');
  assert.equal(getSafeRedirectPath('/account/dashboard?tab=visits'), '/account/dashboard?tab=visits');
  assert.equal(getSafeRedirectPath('/seller/dashboard'), '/seller/dashboard');
});

test('uiSlice auth modal state transitions operate accurately', () => {
  const initial = uiReducer(undefined, { type: '@@INIT' });
  assert.equal(initial.activeAuthModal.isOpen, false);
  assert.equal(initial.activeAuthModal.mode, 'login');

  // Open with string payload
  const openLogin = uiReducer(initial, openAuthModal('register'));
  assert.equal(openLogin.activeAuthModal.isOpen, true);
  assert.equal(openLogin.activeAuthModal.mode, 'register');
  assert.equal(openLogin.activeAuthModal.trigger, 'user');

  // Open with object payload including context and redirect
  const openWithContext = uiReducer(
    openLogin,
    openAuthModal({
      mode: 'login',
      contextMessage: 'Sign in to save this property',
      redirectPath: '/properties/sample-slug',
      postAuthAction: { type: 'save-property', propertyId: 'prop-123' },
      trigger: 'user',
    })
  );
  assert.equal(openWithContext.activeAuthModal.isOpen, true);
  assert.equal(openWithContext.activeAuthModal.mode, 'login');
  assert.equal(openWithContext.activeAuthModal.contextMessage, 'Sign in to save this property');
  assert.equal(openWithContext.activeAuthModal.redirectPath, '/properties/sample-slug');
  assert.deepEqual(openWithContext.activeAuthModal.postAuthAction, {
    type: 'save-property',
    propertyId: 'prop-123',
  });

  // Mode switching inside modal
  const modeForgot = uiReducer(openWithContext, setAuthModalMode('forgot-password'));
  assert.equal(modeForgot.activeAuthModal.mode, 'forgot-password');

  const modeVerify = uiReducer(modeForgot, setAuthModalMode('verify-email'));
  assert.equal(modeVerify.activeAuthModal.mode, 'verify-email');

  const withEmail = uiReducer(modeVerify, setAuthModalVerificationEmail('buyer@example.com'));
  assert.equal(withEmail.activeAuthModal.emailForVerification, 'buyer@example.com');

  // Closing modal resets open state and clears ephemeral context
  const closed = uiReducer(withEmail, closeAuthModal());
  assert.equal(closed.activeAuthModal.isOpen, false);
  assert.equal(closed.activeAuthModal.contextMessage, undefined);
  assert.equal(closed.activeAuthModal.postAuthAction, null);
});

test('auth schemas validate input integrity strictly', () => {
  // Login schema
  assert.equal(loginSchema.safeParse({ email: 'valid@example.com', password: 'password123' }).success, true);
  assert.equal(loginSchema.safeParse({ email: 'invalid-email', password: 'password123' }).success, false);
  assert.equal(loginSchema.safeParse({ email: 'valid@example.com', password: '123' }).success, false);

  // Forgot password schema
  assert.equal(forgotPasswordSchema.safeParse({ email: 'valid@example.com' }).success, true);
  assert.equal(forgotPasswordSchema.safeParse({ email: '' }).success, false);

  // Register schema: passwords must match
  const validRegister = {
    fullName: 'Anand Murugan',
    email: 'anand@example.com',
    mobile: '9842271000',
    accountUsage: 'buyer' as const,
    role: 'buyer' as const,
    district: 'Coimbatore',
    password: 'securePassword123',
    confirmPassword: 'securePassword123',
    termsAccepted: true as const,
    marketingConsent: false,
  };
  assert.equal(registerSchema.safeParse(validRegister).success, true);

  // Fails if passwords don't match
  const mismatchRegister = { ...validRegister, confirmPassword: 'differentPassword123' };
  assert.equal(registerSchema.safeParse(mismatchRegister).success, false);

  // Fails if terms not accepted
  const unacceptedTerms = { ...validRegister, termsAccepted: false as any };
  assert.equal(registerSchema.safeParse(unacceptedTerms).success, false);
});

