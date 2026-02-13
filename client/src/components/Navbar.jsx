import { NavLink} from "react-router-dom";

function Navbar() {

  return (
    <nav className="bg-cyan-400 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <NavLink to="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-3xl"></span>
            <span>Task Generator</span>
          </NavLink>
          <div className="flex gap-2">
            <NavLink
              to="/"
              className={({ isActive }) => `px-6 py-2 rounded-lg font-medium transition-all ${isActive? 'bg-white text-blue-600 shadow-lg':'hover:bg-white/20'}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/AllTasks"
              className={({ isActive }) =>`px-6 py-2 rounded-lg font-medium transition-all ${isActive? 'bg-white text-purple-600 shadow-lg':'hover:bg-white/20'}`}
            >
              All Tasks
            </NavLink>
            <NavLink
              to="/status"
              className={({ isActive }) => `px-6 py-2 rounded-lg font-medium transition-all ${isActive ? 'bg-white text-green-600 shadow-lg' : 'hover:bg-white/20'}`}
            >
              Status
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
