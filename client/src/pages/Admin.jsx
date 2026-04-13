import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
    });
}
function formatWhen(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
}

export default function Admin() {
    const [secret, setSecret] = useState(sessionStorage.getItem('gather_admin_secret') || '');
    const [authed, setAuthed] = useState(!!sessionStorage.getItem('gather_admin_secret'));
    const [tab, setTab] = useState('signups');
    const [signups, setSignups] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [matchResult, setMatchResult] = useState(null);
    const [ratingResult, setRatingResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [s, c] = await Promise.all([api.adminSignups(), api.adminCohorts()]);
            setSignups(s.signups);
            setCohorts(c.cohorts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authed) load();
    }, [authed, load]);

    function handleLogin(e) {
        e.preventDefault();
        sessionStorage.setItem('gather_admin_secret', secret);
        setAuthed(true);
    }

    async function runMatch() {
        setMatchResult(null);
        setRatingResult(null);
        setError('');
        try {
            const result = await api.adminMatch();
            setMatchResult(result);
            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    async function sendRatingEmails() {
        setRatingResult(null);
        setMatchResult(null);
        setError('');
        try {
            const result = await api.adminSendRatingEmails();
            setRatingResult(result);
        } catch (err) {
            setError(err.message);
        }
    }

    if (!authed) {
        return (
            <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6">
                <form onSubmit={handleLogin} className="card w-full space-y-4">
                    <h1 className="font-display text-2xl">Admin</h1>
                    <input
                        type="password"
                        className="input text-sm"
                        placeholder="Admin secret"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary w-full text-sm">
                        Sign in
                    </button>
                </form>
            </main>
        );
    }

    const unmatchedCount = signups.filter(s => !s.matched).length;

    return (
        <main className="mx-auto max-w-5xl px-6 py-10">
            <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl">Gather Admin</h1>
                <button
                    onClick={() => { sessionStorage.removeItem('gather_admin_secret'); setAuthed(false); }}
                    className="text-xs text-gather-ink-soft underline"
                >
                    Logout
                </button>
            </div>

            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            {/* Match action bar */}
            <div className="card mt-6 flex flex-wrap items-center gap-4">
                <div className="flex-1">
                    <p className="text-sm text-gather-ink-soft">
                        <strong className="text-gather-ink">{signups.length}</strong> total signups ·{' '}
                        <strong className="text-gather-accent">{unmatchedCount}</strong> unmatched ·{' '}
                        <strong className="text-gather-ink">{cohorts.length}</strong> cohorts
                    </p>
                </div>
                <button onClick={runMatch} disabled={loading || unmatchedCount < 3} className="btn-primary text-sm disabled:opacity-50">
                    Run matching
                </button>
                <button onClick={sendRatingEmails} disabled={loading} className="btn-secondary text-sm disabled:opacity-50">
                    Send rating emails
                </button>
                <button onClick={load} disabled={loading} className="btn-secondary text-sm disabled:opacity-50">
                    Refresh
                </button>
            </div>

            {matchResult && (
                <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-sm">
                    Created <strong>{matchResult.cohorts_created}</strong> cohort(s),
                    matched <strong>{matchResult.users_matched}</strong> user(s),{' '}
                    <strong>{matchResult.users_still_unmatched}</strong> still unmatched.
                </div>
            )}

            {ratingResult && (
                <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 px-5 py-4 text-sm">
                    Sent <strong>{ratingResult.sent}</strong> rating email(s)
                    {ratingResult.sent === 0 && ' — everyone has already rated or no sessions have passed yet'}.
                </div>
            )}

            {/* Tabs */}
            <div className="mt-8 flex gap-1 border-b border-gather-ink/10">
                {[['signups', 'Signups'], ['cohorts', 'Cohorts']].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
                            tab === key
                                ? 'border-gather-accent text-gather-accent'
                                : 'border-transparent text-gather-ink-soft hover:text-gather-ink'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading && <p className="mt-6 text-sm text-gather-ink-soft">Loading…</p>}

            {/* Signups tab */}
            {tab === 'signups' && !loading && (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gather-ink/10 text-xs uppercase tracking-wider text-gather-ink-soft">
                                <th className="py-3 pr-4">Name</th>
                                <th className="py-3 pr-4">Email</th>
                                <th className="py-3 pr-4">City</th>
                                <th className="py-3 pr-4">Life stage</th>
                                <th className="py-3 pr-4">Joined</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {signups.map((s) => (
                                <tr key={s.id} className="border-b border-gather-ink/5">
                                    <td className="py-3 pr-4 font-medium">{s.name}</td>
                                    <td className="py-3 pr-4 text-gather-ink-soft">{s.email}</td>
                                    <td className="py-3 pr-4">{s.city}</td>
                                    <td className="py-3 pr-4">{s.life_stage}</td>
                                    <td className="py-3 pr-4 text-gather-ink-soft">{formatDate(s.created_at)}</td>
                                    <td className="py-3">
                                        {s.rematch ? (
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Re-match</span>
                                        ) : s.matched ? (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Matched</span>
                                        ) : (
                                            <span className="rounded-full bg-gather-blush px-2 py-0.5 text-xs font-medium text-gather-accent-deep">Waiting</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {signups.length === 0 && (
                                <tr><td colSpan={6} className="py-8 text-center text-gather-ink-soft">No signups yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Cohorts tab */}
            {tab === 'cohorts' && !loading && (
                <div className="mt-6 space-y-6">
                    {cohorts.map((c) => (
                        <div key={c.id} className="card">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-display text-lg">{c.name}</h3>
                                    <p className="text-xs text-gather-ink-soft">{c.city} · Created {formatDate(c.created_at)}</p>
                                </div>
                                {c.session && (
                                    <div className="text-right text-sm">
                                        <p className="font-medium">{formatWhen(c.session.scheduled_at)}</p>
                                        <a
                                            href={c.session.video_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-gather-accent underline"
                                        >
                                            Video link
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {c.members.map((m) => (
                                    <div key={m.id} className="rounded-xl bg-gather-bg-deep px-3 py-2 text-sm">
                                        <span className="font-medium">{m.name}</span>
                                        <span className="ml-2 text-gather-ink-soft">{m.email}</span>
                                        {m.rating && (
                                            <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                                                m.rating === 'yes' ? 'bg-green-100 text-green-700'
                                                    : m.rating === 'maybe' ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {m.rating}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {cohorts.length === 0 && (
                        <p className="py-8 text-center text-gather-ink-soft">No cohorts yet. Run matching to create some.</p>
                    )}
                </div>
            )}
        </main>
    );
}
