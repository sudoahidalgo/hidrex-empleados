(function() {
  window.auth = {
    handleGoogleLogin: typeof handleGoogleLogin === 'function' ? handleGoogleLogin : undefined,
    handleLogout: typeof handleLogout === 'function' ? handleLogout : undefined,
    initializeAuth: typeof initializeAuth === 'function' ? initializeAuth : undefined
  };
})();
