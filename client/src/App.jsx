import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Waiting from './pages/Waiting.jsx';
import Cohort from './pages/Cohort.jsx';
import Rating from './pages/Rating.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
    return (
        <div className="min-h-screen">
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/join" element={<Onboarding />} />
                <Route path="/waiting" element={<Waiting />} />
                <Route path="/cohort" element={<Cohort />} />
                <Route path="/rate" element={<Rating />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}
