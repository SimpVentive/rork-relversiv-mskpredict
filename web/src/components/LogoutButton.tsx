'use client';

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-dangerPrimary hover:text-dangerDark transition-colors"
    >
      Logout
    </button>
  );
}
