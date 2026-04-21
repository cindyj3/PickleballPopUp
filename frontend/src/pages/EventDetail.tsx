import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useApi';
import type { Game, Player, ChatMessage } from '../types';

interface RecordResultModalProps {
  players: Player[];
  onClose: () => void;
  onRecorded: () => void;
  apiFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
  gameId: string;
}

function RecordResultModal({ players, onClose, onRecorded, apiFetch, gameId }: RecordResultModalProps) {
  const [winner, setWinner] = useState('');
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!winner) { setError('Select a winner'); return; }
    setLoading(true);
    try {
      await apiFetch(`/api/games/${gameId}/result`, {
        method: 'POST',
        body: JSON.stringify({ winner, score, players: players.map(p => p.username ?? p.Username) }),
      });
      onRecorded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Record Match Result</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Winner</label>
            <select className="form-input" value={winner} onChange={e => setWinner(e.target.value)} required>
              <option value="">-- Select winner --</option>
              {players.map(p => {
                const name = p.username ?? p.Username ?? '';
                return <option key={name} value={name}>{name}</option>;
              })}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Score (optional)</label>
            <input className="form-input" value={score} onChange={e => setScore(e.target.value)} placeholder="e.g. 11-7" />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Record Result'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatTime(t: string | undefined): string {
  if (!t) return '';
  try {
    return new Date(t).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return t; }
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { username, apiFetch } = useAuth();
  const navigate = useNavigate();
  const { show, Notification } = useNotification();

  const [event, setEvent] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecord, setShowRecord] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [teams, setTeams] = useState<[Player[], Player[]] | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [eventsData, playersData, chatData] = await Promise.all([
        apiFetch<Game[]>('/api/games'),
        apiFetch<Player[]>(`/api/games/${id}/players`),
        apiFetch<ChatMessage[]>(`/api/games/${id}/chat`),
      ]);
      setEvent(eventsData.find(g => String(g.gid ?? g.GID) === String(id)) ?? null);
      setPlayers(playersData);
      setChat(chatData);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Load failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleJoin = async () => {
    try { await apiFetch(`/api/games/${id}/join`, { method: 'POST', body: JSON.stringify({ username }) }); show('Joined!', 'success'); load(); }
    catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  const handleLeave = async () => {
    try { await apiFetch(`/api/games/${id}/leave`, { method: 'POST', body: JSON.stringify({ username }) }); show('Left event', 'default'); load(); }
    catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  const handleFinish = async () => {
    try { await apiFetch(`/api/games/${id}/finish`, { method: 'POST' }); show('Event completed!', 'success'); load(); }
    catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    try { await apiFetch(`/api/games/${id}/delete`, { method: 'POST', body: JSON.stringify({ username }) }); navigate('/events'); }
    catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    try {
      await apiFetch(`/api/games/${id}/chat`, { method: 'POST', body: JSON.stringify({ username, content: chatMsg }) });
      setChatMsg(''); load();
    } catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  const handleRandomize = () => {
    if (players.length < 2) { show('Need at least 2 players', 'error'); return; }
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    setTeams([shuffled.slice(0, mid), shuffled.slice(mid)]);
    show('Teams randomized!', 'success');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>Loading...</div>;

  if (!event) return (
    <div>
      <button onClick={() => navigate('/events')} className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>← Back</button>
      <div className="empty-state"><div className="empty-title">Event not found</div></div>
    </div>
  );

  const isCompleted = (event.status ?? event.Status) === 'completed';
  const isCreator = (event.createdby ?? event.CreatedBy) === username;
  const isJoined = players.some(p => (p.username ?? p.Username) === username);
  const location = event.location ?? event.Location ?? '';
  const gameTime = event.gametime ?? event.GameTime ?? '';

  return (
    <div className="fade-in">
      {Notification}

      <button onClick={() => navigate('/events')} style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
        ← Back to Events
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="page-title">{location}</div>
          <div style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 6 }}>🕐 {formatTime(gameTime)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className={`badge ${isCompleted ? 'badge-gray' : 'badge-green'}`}>
            {event.status ?? event.Status ?? 'scheduled'}
          </span>
          {!isCompleted && !isJoined && <button className="btn btn-primary btn-sm" onClick={handleJoin}>Join</button>}
          {!isCompleted && isJoined && !isCreator && <button className="btn btn-danger btn-sm" onClick={handleLeave}>Leave</button>}
          {!isCompleted && isCreator && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handleRandomize}>🔀 Teams</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowRecord(true)} disabled={players.length < 2}>📝 Record</button>
              <button className="btn btn-primary btn-sm" onClick={handleFinish}>✓ Finish</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
            Players <span style={{ color: 'var(--gray-500)', fontWeight: 400, fontSize: 14 }}>({players.length})</span>
          </div>
          {players.length === 0 && <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>No players yet — be the first!</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((p, idx) => {
              const name = p.username ?? p.Username ?? '';
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{name[0]?.toUpperCase()}</div>
                  <span style={{ fontSize: 14 }}>{name}</span>
                  {name === username && <span className="badge badge-green" style={{ fontSize: 10 }}>You</span>}
                  {name === (event.createdby ?? event.CreatedBy) && <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>host</span>}
                </div>
              );
            })}
          </div>
        </div>

        {teams && (
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 18, fontWeight: 700 }}>Teams</div>
              <button className="btn btn-secondary btn-sm" onClick={handleRandomize}>Re-shuffle</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {teams.map((team, i) => (
                <div key={i} style={{ background: i === 0 ? 'var(--green-light)' : 'var(--yellow-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 14, fontWeight: 700, color: i === 0 ? 'var(--green-dark)' : 'var(--yellow-dark)', marginBottom: 8 }}>
                    TEAM {String.fromCharCode(65 + i)}
                  </div>
                  {team.map((p, j) => {
                    const name = p.username ?? p.Username ?? '';
                    return <div key={j} style={{ fontSize: 13, marginBottom: 4 }}>{name}</div>;
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '20px 22px', marginTop: 20 }}>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Event Chat</div>
        <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chat.length === 0 && <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>No messages yet</div>}
          {chat.map((msg, i) => {
            const msgName = msg.username ?? msg.Username ?? '';
            const isMe = msgName === username;
            return (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, flexShrink: 0 }}>{msgName[0]?.toUpperCase()}</div>
                <div style={{ background: isMe ? 'var(--green-light)' : 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '7px 11px', maxWidth: '70%' }}>
                  {!isMe && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 2 }}>{msgName}</div>}
                  <div style={{ fontSize: 13 }}>{msg.content ?? msg.Content}</div>
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 8 }}>
          <input className="form-input" value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Say something..." style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary btn-sm">Send</button>
        </form>
      </div>

      {showRecord && (
        <RecordResultModal
          players={players}
          onClose={() => setShowRecord(false)}
          onRecorded={() => { show('Result recorded!', 'success'); load(); }}
          apiFetch={apiFetch}
          gameId={id!}
        />
      )}
    </div>
  );
}
