import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api.js';

export default function ReturningUser() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            const { token } = await api.login(email);
            setToken(token);
            navigate('/cohort');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="mt-6 text-xs text-gather-ink-soft underline underline-offset-2 hover:text-gather-accent transition-colors"
            >
                Already joined? Enter your email to check your status
            </button>
        );
    }

    return (
        <form onSubmit={onSubmit} className="mt-6 flex w-full max-w-sm flex-col items-center gap-3">
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="input text-center text-sm"
            />
            <button
                type="submit"
                disabled={busy}
                className="btn-secondary text-sm disabled:opacity-50"
            >
                {busy ? 'Checking…' : 'Check my status'}
            </button>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </form>
    );
}
