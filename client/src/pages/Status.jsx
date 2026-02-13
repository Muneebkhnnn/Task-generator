import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Status() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async () => {
    try {
      const response = await axios.get('/api/v1/health');
      setHealth(response.data.data);
      setLastCheck(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Health check failed:', error);
      if (error.response?.data?.data) {
        setHealth(error.response.data.data);
      }
      setLastCheck(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealth();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'unhealthy':
        return '✕';
      default:
        return '?';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'unhealthy':
        return 'Down';
      default:
        return 'Unknown';
    }
  };

  const handleManualRefresh = () => {
    toast.promise(
      fetchHealth(),
      {
        loading: 'Checking health...',
        success: 'Health check complete',
        error: 'Health check failed'
      }
    );
  };

  const overallStatus = health
    ? health.server.status === 'healthy' && 
      health.database.status === 'healthy' && 
      health.llm.status === 'healthy'
      ? 'healthy'
      : 'unhealthy'
    : 'unknown';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">System Status</h1>
            <p className="text-gray-600">
              Real-time monitoring of all system components
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">Auto-refresh (30s)</span>
            </label>
            <button
              onClick={handleManualRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {lastCheck && (
          <p className="text-sm text-gray-500">
            Last checked: {lastCheck.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Overall Status Banner */}
      <div
        className={`p-6 rounded-xl mb-8 text-white ${
          overallStatus === 'healthy'
            ? 'bg-gradient-to-r from-green-500 to-green-600'
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="text-5xl">
            {overallStatus === 'healthy' ? '✓' : '✕'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {overallStatus === 'healthy'
                ? 'All Systems Operational'
                : 'System Issues Detected'}
            </h2>
            <p className="text-white/80">
              {overallStatus === 'healthy'
                ? 'Everything is running smoothly'
                : 'Some components are experiencing issues'}
            </p>
          </div>
        </div>
      </div>

      {/* Component Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Server Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-blue-300 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Backend Server</h3>
            <div
              className={`w-4 h-4 rounded-full ${getStatusColor(
                health?.server.status
              )}`}
            ></div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  health?.server.status === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {getStatusIcon(health?.server.status)}{' '}
                {getStatusText(health?.server.status)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-semibold">
                {health?.server.responseTime}ms
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-xs text-gray-500">
                🖥️ Node.js + Express
              </span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-blue-300 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Database</h3>
            <div
              className={`w-4 h-4 rounded-full ${getStatusColor(
                health?.database.status
              )}`}
            ></div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  health?.database.status === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {getStatusIcon(health?.database.status)}{' '}
                {getStatusText(health?.database.status)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-semibold">
                {health?.database.responseTime}ms
              </span>
            </div>
            {health?.database.error && (
              <div className="pt-2 border-t">
                <p className="text-xs text-red-600 break-words">
                  Error: {health.database.error}
                </p>
              </div>
            )}
            <div className="pt-2 border-t">
              <span className="text-xs text-gray-500">
                🗄️ PostgreSQL
              </span>
            </div>
          </div>
        </div>

        {/* LLM Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-blue-300 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">AI Service</h3>
            <div
              className={`w-4 h-4 rounded-full ${getStatusColor(
                health?.llm.status
              )}`}
            ></div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  health?.llm.status === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {getStatusIcon(health?.llm.status)}{' '}
                {getStatusText(health?.llm.status)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-semibold">
                {health?.llm.responseTime}ms
              </span>
            </div>
            {health?.llm.error && (
              <div className="pt-2 border-t">
                <p className="text-xs text-red-600 break-words">
                  Error: {health.llm.error}
                </p>
              </div>
            )}
            <div className="pt-2 border-t">
              <span className="text-xs text-gray-500">
                🤖 Google Gemini API
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📊 System Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Environment</p>
            <p className="font-semibold">Production</p>
          </div>
          <div>
            <p className="text-gray-600">Uptime</p>
            <p className="font-semibold">99.9%</p>
          </div>
          <div>
            <p className="text-gray-600">Version</p>
            <p className="font-semibold">v1.0.0</p>
          </div>
          <div>
            <p className="text-gray-600">Region</p>
            <p className="font-semibold">Global</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Status Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">Degraded Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Service Outage</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Status;
