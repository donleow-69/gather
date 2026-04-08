import { useState } from 'react';
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
        <main className="mx-auto max-w-lg px-6 py-16">
            <h1 className="text-3xl font-bold">Tell us about you</h1>
            <p className="mt-2 text-gather-ink/60">
                We'll use this to match you with a small group near you.
            </p>

            <form onSubmit={onSubmit} className="card mt-8 space-y-5">
                <div>
                    <label className="label">First name</label>
                    <input className="input" required value={form.name} onChange={update('name')} />
                </div>
                <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" required value={form.email} onChange={update('email')} />
                </div>
                <div>
                    <label className="label">City</label>
                    <input className="input" required value={form.city} onChange={update('city')} placeholder="e.g. Singapore" />
                </div>
                <div>
                    <label className="label">Life stage</label>
                    <select className="input" required value={form.life_stage} onChange={update('life_stage')}>
                        <option value="">Select one…</option>
                        {LIFE_STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
                    {submitting ? 'Joining…' : 'Join Gather'}
                </button>
            </form>
        </main>
    );
}
