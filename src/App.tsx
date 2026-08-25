import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Spreadsheet from './pages/Spreadsheet';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen bg-[#0b1220]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Spreadsheet />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </HashRouter>
    </AppProvider>
  );
}
