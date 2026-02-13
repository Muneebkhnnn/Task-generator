import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        goal: "",
        users: "",
        constraints: "",
        template: "agile",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("/api/v1/tasks", formData);

            if (response.status === 201) {
                toast.success("Task created successfully!");

                setFormData({
                    goal: "",
                    users: "",
                    constraints: "",
                    template: "agile",
                });
                
                setTimeout(() => navigate("/AllTasks"), 1000);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "Failed to create task");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <>
            <div className="max-w-2xl mx-auto p-6 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-3 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Task Generator
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Transform your ideas into structured plans with user stories, engineering tasks, and risk assessments
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                            🎯 Goal
                        </label>
                        <input
                            type="text"
                            name="goal"
                            value={formData.goal}
                            onChange={handleChange}
                            placeholder="e.g., Build a real-time chat application"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                            👥 Target Users
                        </label>
                        <input
                            type="text"
                            name="users"
                            value={formData.users}
                            onChange={handleChange}
                            placeholder="e.g., Remote teams, Students, Enterprise customers"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                            ⚡ Constraints
                        </label>
                        <input
                            type="text"
                            name="constraints"
                            value={formData.constraints}
                            onChange={handleChange}
                            placeholder="e.g., 2 week timeline, $5k budget, mobile-first"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                            📋 Template Type
                        </label>
                        <select
                            name="template"
                            value={formData.template}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                            disabled={loading}
                        >
                            <option value="Mobile">📱 Mobile App</option>
                            <option value="Web">🌐 Web Application</option>
                            <option value="Internal Tool">🔧 Internal Tool</option>
                            <option value="agile">🚀 Agile Project</option>
                            <option value="waterfall">📊 Waterfall Project</option>
                            <option value="lean">⚡ Lean Startup</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className=" cursor-pointer w-full bg-green-400 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Tasks...
                            </span>
                        ) : (
                            "✨ Generate Tasks"
                        )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        AI-powered generation typically takes 5-10 seconds
                    </p>
                </form >
            </div>

        </>
    );
}

export default Home;
