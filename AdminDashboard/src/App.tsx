import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

const data = [
  { time: '08:00', attendance: 12 },
  { time: '09:00', attendance: 45 },
  { time: '10:00', attendance: 89 },
  { time: '11:00', attendance: 110 },
  { time: '12:00', attendance: 115 },
  { time: '13:00', attendance: 120 },
  { time: '14:00', attendance: 124 },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-[#1D9E75] text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">FieldGuard Admin</h1>
        <div className="text-sm">Logged in as: Supervisor</div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 rounded-full bg-green-100 text-green-600 mr-4">
              <Users size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Enrolled</p>
              <p className="text-2xl font-bold">350</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 rounded-full bg-blue-100 text-blue-600 mr-4">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Today's Attendance</p>
              <p className="text-2xl font-bold">124</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Devices</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 rounded-full bg-red-100 text-red-600 mr-4">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Anomalies Detected</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Attendance Trends</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendance" stroke="#1D9E75" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Recent Syncs</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-3 px-4 font-normal">Device ID</th>
                    <th className="py-3 px-4 font-normal">Last Seen</th>
                    <th className="py-3 px-4 font-normal">Records Sync'd</th>
                    <th className="py-3 px-4 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">device-101</td>
                    <td className="py-3 px-4">10 mins ago</td>
                    <td className="py-3 px-4">42</td>
                    <td className="py-3 px-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Online</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">device-102</td>
                    <td className="py-3 px-4">2 hours ago</td>
                    <td className="py-3 px-4">18</td>
                    <td className="py-3 px-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Offline</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
