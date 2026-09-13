import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OpeningScreen from './screens/OpeningScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import RaceControlScreen from './screens/RaceControlScreen';
import TyreIntelligenceScreen from './screens/TyreIntelligenceScreen';
import ValidationScreen from './screens/ValidationScreen';
import MethodologyValidationScreen from './screens/MethodologyValidationScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OpeningScreen />} />
        <Route path="/menu" element={<MainMenuScreen />} />
        <Route path="/race-control" element={<RaceControlScreen />} />
        <Route path="/tyre-intelligence" element={<TyreIntelligenceScreen />} />
        <Route path="/validation" element={<ValidationScreen />} />
        <Route path="/methodology-validation" element={<MethodologyValidationScreen />} />
        {}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}