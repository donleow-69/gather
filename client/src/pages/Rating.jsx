import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';

const OPTIONS = [
    { value: 'yes',   label: 'Yes',   sub: "I'd see them again" },
    { value: 'maybe', label: 'Maybe', sub: 'It was nice, not sure' },
    { value: 'no',    label: 'No',    sub: 'Not quite my people' },
];

export default function Rating() {
    const location = useLocation();
    const [sessionId, setSessionId] = useState(location.state?.sessionId || null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

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
            <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
                <div className="card-lg w-full">
                    <h1 className="display text-4xl">
                        Thank you<span className="italic text-gather-accent">.</span>
                    </h1>
                    <p className="mt-4 text-gather-ink-soft">
                        Your honesty is what makes the next circle better.
                        We're glad you came.
                    </p>
                    <Link to="/cohort" className="btn-secondary mt-8">
                        Back to my circle
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-2xl px-6 py-20 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gather-ink-soft">
                A quiet question
            </p>
            <h1 className="display mt-4 text-4xl sm:text-5xl">
                Would you meet
                <br />
                <span className="italic text-gather-accent">this group again?</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-gather-ink-soft">
                There's no wrong answer. We won't share your reply with the others —
                it just helps us match better next time.
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => submit(opt.value)}
                        disabled={busy || !sessionId}
                        className="btn-tactile flex-col disabled:opacity-50"
                    >
                        <span className="font-display text-2xl">{opt.label}</span>
                        <span className="mt-1 text-sm font-normal text-gather-ink-soft">
                            {opt.sub}
                        </span>
                    </button>
                ))}
            </div>

            {error && (
                <p className="mx-auto mt-8 max-w-sm rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}
        </main>
    );
}
