'use client';
import React, { useState } from 'react';
import { User, Bell, BookOpen, Calendar, TrendingUp, Shield, LogOut, Menu, X } from 'lucide-react';

const GuardianDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?')) {
      // Clear any stored session data
      // In a real app, you'd clear tokens, cookies, etc.
      setIsLoggedIn(false);
      // Redirect to login page or show login form
      alert('সফলভাবে লগআউট হয়েছে। আপনি এখন লগইন পেজে যেতে পারেন।');
    }
  };

  // Mock data for demonstration
  const childData = {
    name: "আহমেদ রহমান",
    class: "৮ম শ্রেণি",
    section: "A",
    roll: "15",
    photo: "/api/placeholder/100/100"
  };

  const notifications = [
    { id: 1, message: "আগামীকাল গণিত পরীক্ষা অনুষ্ঠিত হবে", time: "২ ঘন্টা আগে", type: "exam" },
    { id: 2, message: "মাসিক অভিভাবক সভা ২৫ তারিখে", time: "১ দিন আগে", type: "meeting" },
    { id: 3, message: "আপনার সন্তানের উপস্থিতি ৯৫% এ পৌঁছেছে", time: "২ দিন আগে", type: "attendance" }
  ];

  const progressData = [
    { subject: "বাংলা", marks: 85, total: 100, grade: "A" },
    { subject: "ইংরেজি", marks: 78, total: 100, grade: "A-" },
    { subject: "গণিত", marks: 92, total: 100, grade: "A+" },
    { subject: "বিজ্ঞান", marks: 88, total: 100, grade: "A" },
    { subject: "সামাজিক বিজ্ঞান", marks: 80, total: 100, grade: "A-" }
  ];

  const attendanceData = {
    totalDays: 180,
    presentDays: 171,
    absentDays: 9,
    percentage: 95
  };

  const weeklyAttendance = [
    { day: 'রবিবার', date: '১০/০৭', status: 'present', banglaDay: 'রবি' },
    { day: 'সোমবার', date: '১১/০৭', status: 'present', banglaDay: 'সোম' },
    { day: 'মঙ্গলবার', date: '১২/০৭', status: 'present', banglaDay: 'মঙ্গল' },
    { day: 'বুধবার', date: '১৩/০৭', status: 'absent', banglaDay: 'বুধ' },
    { day: 'বৃহস্পতিবার', date: '১৪/০৭', status: 'present', banglaDay: 'বৃহ' },
    { day: 'শুক্রবার', date: '১৫/০৭', status: 'present', banglaDay: 'শুক্র' },
    { day: 'শনিবার', date: '১৬/০৭', status: 'holiday', banglaDay: 'শনি' }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'সারসংক্ষেপ', icon: BookOpen },
    { id: 'progress', label: 'অগ্রগতি রিপোর্ট', icon: TrendingUp },
    { id: 'attendance', label: 'উপস্থিতি', icon: Calendar },
    { id: 'notifications', label: 'বিজ্ঞপ্তি', icon: Bell }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{childData.name}</h2>
            <p className="text-gray-600">{childData.class} - শাখা: {childData.section}</p>
            <p className="text-gray-600">রোল নং: {childData.roll}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">সামগ্রিক গড়</p>
              <p className="text-3xl font-bold">৮৪.৬%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">উপস্থিতি</p>
              <p className="text-3xl font-bold">৯৫%</p>
            </div>
            <Calendar className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">নতুন বিজ্ঞপ্তি</p>
              <p className="text-3xl font-bold">{notifications.length}</p>
            </div>
            <Bell className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">বিস্তারিত অগ্রগতি রিপোর্ট</h3>
        <div className="space-y-4">
          {progressData.map((subject, index) => (
            <div key={index} className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{subject.subject}</span>
                <span className="text-sm font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {subject.grade}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(subject.marks / subject.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {subject.marks}/{subject.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">উপস্থিতি পর্যবেক্ষণ</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{attendanceData.totalDays}</div>
            <div className="text-sm text-gray-600">মোট দিন</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{attendanceData.presentDays}</div>
            <div className="text-sm text-gray-600">উপস্থিত</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{attendanceData.absentDays}</div>
            <div className="text-sm text-gray-600">অনুপস্থিত</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{attendanceData.percentage}%</div>
            <div className="text-sm text-gray-600">শতাংশ</div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2">সামগ্রিক উপস্থিতির চার্ট</h4>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${attendanceData.percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            চমৎকার! আপনার সন্তানের উপস্থিতি খুবই ভালো।
          </p>
        </div>

        {/* Weekly Attendance Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-medium mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            সাপ্তাহিক উপস্থিতি চার্ট
          </h4>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weeklyAttendance.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{day.banglaDay}</div>
                <div className="text-xs text-gray-400 mb-2">{day.date}</div>
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xs font-medium ${
                  day.status === 'present' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                  day.status === 'absent' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                  'bg-gray-100 text-gray-500 border-2 border-gray-300'
                }`}>
                  {day.status === 'present' ? '✓' : 
                   day.status === 'absent' ? '✗' : 
                   '—'}
                </div>
                <div className="text-xs mt-1 text-gray-600">
                  {day.status === 'present' ? 'উপস্থিত' : 
                   day.status === 'absent' ? 'অনুপস্থিত' : 
                   'ছুটি'}
                </div>
              </div>
            ))}
          </div>
          
          {/* Weekly Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-blue-800 mb-2">এই সপ্তাহের সারসংক্ষেপ</h5>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">৫</div>
                <div className="text-gray-600">উপস্থিত</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">১</div>
                <div className="text-gray-600">অনুপস্থিত</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-600">১</div>
                <div className="text-gray-600">ছুটি</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm text-blue-700 font-medium">
                সাপ্তাহিক উপস্থিতি: ৮৩.৩%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">স্কুল থেকে বিজ্ঞপ্তি</h3>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-800">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                </div>
                <div className="ml-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    notification.type === 'exam' ? 'bg-red-100 text-red-800' :
                    notification.type === 'meeting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {notification.type === 'exam' ? 'পরীক্ষা' :
                     notification.type === 'meeting' ? 'সভা' : 'সাধারণ'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'progress': return renderProgress();
      case 'attendance': return renderAttendance();
      case 'notifications': return renderNotifications();
      default: return renderOverview();
    }
  };

  // Show login prompt if user is logged out
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">লগআউট সম্পন্ন</h2>
            <p className="text-gray-600 mb-6">আপনি সফলভাবে লগআউট হয়েছেন। আবার লগইন করতে নিচের বাটনে ক্লিক করুন।</p>
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              আবার লগইন করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">অভিভাবক প্যানেল</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700' : 'text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">স্বাগতম,</p>
                  <p className="font-medium text-gray-800">মোঃ আব্দুল করিম</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600">
                আপনার সন্তানের শিক্ষা অগ্রগতি ও তথ্য এখানে দেখুন
              </p>
            </div>
            
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GuardianDashboard;