import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/events', label: 'Events', icon: '📅' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/history', label: 'Game History', icon: '📋' },
];

export default function Layout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = username ? username.slice(0, 2).toUpperCase() : '?';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 220, background: 'var(--charcoal)', display: 'flex',
        flexDirection: 'column', padding: '24px 0', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>

              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--white)', letterSpacing: 0.5 }}>BARN BOYS</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>BARN BOYS SCOREBOOK</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px' }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 'var(--radius-md)', marginBottom: 2, fontSize: 14, fontWeight: 500,
              color: isActive ? 'var(--white)' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent', transition: 'all 0.15s',
              textDecoration: 'none',
            })}>
              <span style={{ fontSize: 15 }}>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar" style={{ background: 'var(--green)', color: 'var(--white)', flexShrink: 0, width: 32, height: 32, fontSize: 12 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
          </div>
          <button onClick={handleLogout} title="Sign out" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16, padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>↩</button>
        </div>
      </aside>

      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px' }}>
        <Outlet />
      </main>
    </div>
  );
}
