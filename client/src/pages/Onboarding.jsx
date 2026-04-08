import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api.js';

const LIFE_STAGES = [
    'New to city',
    'Recently retired',
    'Empty nester',
    'Working remotely',
    'Recently divorced or separated',
    'Other',
];

export default function Onboarding() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', city: '', life_stage: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    // Friendly progress: how many of the 4 fields are filled
    const filled = useMemo(
        () => Object.values(form).filter((v) => v.trim()).length,
        [form]
    );

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { token } = await api.signup(form);
            setToken(token);
            navigate('/waiting');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="mx-auto max-w-xl px-6 py-16">
            {/* Friendly progress dots */}
            <div className="mb-10 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    {[0, 1, 2, 3].map((i) => (
                        <span
                            key={i}
                            className={`dot ${i < filled ? 'dot-filled' : ''}`}
                        />
                    ))}
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-gather-ink-soft">
                    {filled === 4 ? 'Ready when you are' : `${filled} of 4`}
                </p>
            </div>

            <h1 className="display text-center text-4xl sm:text-5xl">
                Tell us a little
                <br />
                <span className="italic text-gather-accent">about you.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-center text-gather-ink-soft">
                Just the basics. We'll use this to find people who get where you are right now.
            </p>

            <form onSubmit={onSubmit} className="card-lg mt-12 space-y-7">
                <div>
                    <label className="label">First name</label>
                    <input
                        className="input"
                        required
                        value={form.name}
                        onChange={update('name')}
                        placeholder="What should we call you?"
                    />
                </div>
                <div>
                    <label className="label">Email</label>
                    <input
                        className="input"
                        type="email"
                        required
                        value={form.email}
                        onChange={update('email')}
                        placeholder="So we can let you know when your circle is ready"
                    />
                </div>
                <div>
                    <label className="label">City</label>
                    <input
                        className="input"
                        required
                        value={form.city}
                        onChange={update('city')}
                        placeholder="Where are you these days?"
                    />
                </div>
                <div>
                    <label className="label">Life stage</label>
                    <select
                        className="input"
                        required
                        value={form.life_stage}
                        onChange={update('life_stage')}
                    >
                        <option value="">Pick the one that fits best…</option>
                        {LIFE_STAGES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full disabled:opacity-50"
                >
                    {submitting ? 'Joining…' : 'Join Gather'}
                </button>

                <p className="text-center text-xs text-gather-ink-soft">
                    We'll never share your details. Promise.
                </p>
            </form>
        </main>
    );
}
