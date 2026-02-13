import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AllTasks from "./pages/AllTasks";
import Status from "./pages/Status";
import "./App.css";


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/AllTasks" element={<AllTasks />} />
            <Route path="/status" element={<Status />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
