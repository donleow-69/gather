import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';

const OPTIONS = [
    { value: 'yes', label: 'Yes' },
    { value: 'maybe', label: 'Maybe' },
    { value: 'no', label: 'No' },
];

export default function Rating() {
    const location = useLocation();
    const [sessionId, setSessionId] = useState(location.state?.sessionId || null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    // If we got here directly (no router state), look up the user's session.
    useEffect(() => {
        if (sessionId) return;
        api.myCohort()
            .then((data) => setSessionId(data.cohort?.session?.id || null))
            .catch((err) => setError(err.message));
    }, [sessionId]);

    async function submit(value) {
        if (!sessionId) return;
        setBusy(true);
        setError('');
        try {
            await api.rate(sessionId, value);
            setSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    if (submitted) {
        return (
            <Centered>
                <h1 className="text-2xl font-bold">Thanks for the feedback.</h1>
                <p className="mt-3 text-gather-ink/70">It helps us match better next time.</p>
                <Link to="/cohort" className="btn-secondary mt-6">Back to my circle</Link>
            </Centered>
        );
    }

    return (
        <main className="mx-auto max-w-xl px-6 py-16 text-center">
            <h1 className="text-3xl font-bold">Would you meet this group again?</h1>
            <div className="mt-10 flex justify-center gap-4">
                {OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => submit(opt.value)}
                        disabled={busy || !sessionId}
                        className="btn-secondary min-w-[100px] disabled:opacity-50"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
        </main>
    );
}

function Centered({ children }) {
    return (
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
            {children}
        </main>
    );
}
