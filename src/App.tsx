import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Spreadsheet from './pages/Spreadsheet';
import FtoUpload from './pages/FtoUpload';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen bg-[#0b1220]">
          <Routes>
            <Route path="/" element={<Spreadsheet />} />
            <Route path="/fto" element={<FtoUpload />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </HashRouter>
    </AppProvider>
  );
}
