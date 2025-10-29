import React from "react";
import Overview from "../components/instructor/Overview";


const InstructorDashboard = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Instructor</h2>
        <nav className="space-y-3">
          <a href="#" className="block text-gray-700 hover:text-blue-600">📊 Dashboard</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">📘 My Courses</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">➕ Create Course</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">👩‍🎓 Students</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">⭐ Reviews & Q&A</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <img
              src="https://via.placeholder.com/40"
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-medium">John Doe</span>
          </div>
        </header>

        {/* <Overview /> */}

      </main>
    </div>
  );
};

export default InstructorDashboard;
