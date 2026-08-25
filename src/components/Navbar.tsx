import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { auth, setAuth, state } = useApp();

  return (
    <header className="bg-[#0b1220] border-b border-slate-800 text-slate-100">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-600 flex items-center justify-center font-bold text-lg">
            A
          </div>
          <div>
            <div className="font-semibold leading-tight">Academy Training Management</div>
            <div className="text-xs text-slate-400 leading-tight">Roster &amp; FTO Training System</div>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition ${
                isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`
            }
          >
            Spreadsheet
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition ${
                isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`
            }
          >
            Admin Panel
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Role</label>
          <select
            value={auth.role}
            onChange={(e) => setAuth({ role: e.target.value as 'fto' | 'admin', ftoId: null })}
            className="bg-slate-800 border border-slate-700 rounded-md text-sm px-2 py-1.5 text-slate-100"
          >
            <option value="admin">Academy Supervisor / Admin</option>
            <option value="fto">FTO</option>
          </select>

          {auth.role === 'fto' && (
            <select
              value={auth.ftoId ?? ''}
              onChange={(e) => setAuth({ role: 'fto', ftoId: e.target.value || null })}
              className="bg-slate-800 border border-slate-700 rounded-md text-sm px-2 py-1.5 text-slate-100"
            >
              <option value="">Select FTO...</option>
              {state.ftos
                .filter((f) => f.active)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>
    </header>
  );
}
