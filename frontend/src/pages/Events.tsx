import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useApi, useNotification } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import type { Game } from '../types';

function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { apiFetch, username } = useAuth();
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await apiFetch('/api/games', {
        method: 'POST',
        body: JSON.stringify({ location, time, username }),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Create New Event</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Location / Court</label>
            <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Court A, Riverside Park" required />
          </div>
          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input className="form-input" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} required />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatTime(t: string): string {
  try {
    return new Date(t).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return t;
  }
}

export default function Events() {
  const { data: events, loading, error, refetch } = useApi<Game[]>('/api/games');
  const [showCreate, setShowCreate] = useState(false);
  const { show, Notification } = useNotification();

  return (
    <div>
      {Notification}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div className="page-title">Events</div>
          <div className="page-subtitle">Join a session or create your own</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Event</button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>Loading events...</div>}

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 14 }}>
          ⚠️ Can't reach server — make sure your backend is running.
          <br /><span style={{ fontSize: 12, opacity: 0.8 }}>{error}</span>
        </div>
      )}

      {!loading && !error && (events ?? []).length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-title">No events yet</div>
          <div style={{ marginBottom: 20 }}>Create the first pickleball event!</div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Event</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(events ?? []).map(event => (
          <Link key={event.gid ?? event.GID} to={`/events/${event.gid ?? event.GID}`} style={{ textDecoration: 'none' }}>
            <div
              className="card fade-in"
              style={{ padding: '18px 22px', cursor: 'pointer', transition: 'transform 0.12s, box-shadow 0.12s', display: 'flex', alignItems: 'center', gap: 16 }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
            >
              <div style={{ width: 44, height: 44, background: event.Status === 'completed' ? 'var(--gray-100)' : 'var(--green-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {event.Status === 'completed' ? '✅' : '🏓'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 19, fontWeight: 700 }}>{event.location ?? event.Location ?? 'TBD'}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>🕐 {formatTime(event.gametime ?? event.GameTime)}</div>
              </div>
              <span className={`badge ${(event.status ?? event.Status) === 'completed' ? 'badge-gray' : 'badge-green'}`}>{event.status ?? event.Status ?? 'scheduled'}</span>
              <span style={{ color: 'var(--gray-300)', fontSize: 18 }}>›</span>
            </div>
          </Link>
        ))}
      </div>

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { show('Event created!', 'success'); refetch(); }}
        />
      )}
    </div>
  );
}
