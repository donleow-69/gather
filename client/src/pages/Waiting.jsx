import { Link } from 'react-router-dom';

export default function Waiting() {
    return (
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
            <div className="card">
                <h1 className="text-3xl font-bold">You're in.</h1>
                <p className="mt-4 text-gather-ink/70">
                    We'll match you with a small group of people in your city soon.
                    You'll get an email with your meetup details once your circle is ready —
                    usually within a week.
                </p>
                <Link to="/cohort" className="btn-secondary mt-8">
                    Check on my circle
                </Link>
            </div>
        </main>
    );
}
