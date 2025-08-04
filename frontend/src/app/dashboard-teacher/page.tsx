'use client';
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, Calendar, Star, Coffee, Heart, Sparkles, Moon } from 'lucide-react';

export default function MadrasaTeacherDashboard() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [easterEggTriggered, setEasterEggTriggered] = useState(false);
  const [showAlert, setShowAlert] = useState('');

  // Quick action handlers
  const handleAttendance = () => {
    setShowAlert('হাজিরা নেওয়ার পেজে যাচ্ছেন...');
    setTimeout(() => setShowAlert(''), 2000);
  };

  const handleGrading = () => {
    setShowAlert('পরীক্ষার নম্বর দেওয়ার পেজে যাচ্ছেন...');
    setTimeout(() => setShowAlert(''), 2000);
  };

  const handleHomework = () => {
    setShowAlert('গৃহকর্ম দেওয়ার পেজে যাচ্ছেন...');
    setTimeout(() => setShowAlert(''), 2000);
  };

  // Easter egg trigger - click the moon (Islamic symbol) 5 times
  const handleMoonClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 5) {
      setEasterEggTriggered(true);
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 6000);
    }
  };

  const stats = [
    { label: 'মোট ছাত্র-ছাত্রী', value: '142', icon: Users, color: 'bg-emerald-500' },
    { label: 'আজকের দরস', value: '6', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'নতুন মাসআলা', value: '8', icon: FileText, color: 'bg-purple-500' },
    { label: 'আগামীর অনুষ্ঠান', value: '2', icon: Calendar, color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { text: 'হিফয বিভাগের কুরআন তিলাওয়াত প্রতিযোগিতা', time: '১ ঘণ্টা আগে' },
    { text: 'নাহু-সরফ পরীক্ষার ফলাফল প্রকাশ', time: '৩ ঘণ্টা আগে' },
    { text: 'ফিকাহ ক্লাসের আলোচনা সম্পন্ন', time: '৫ ঘণ্টা আগে' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-emerald-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">মাদ্রাসা শিক্ষক ড্যাশবোর্ড</h1>
            <p className="text-gray-600 mt-2">بسم الله الرحمن الرحيم - আল্লাহর নামে শুরু</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMoonClick}
              className="p-3 bg-emerald-100 rounded-full hover:bg-emerald-200 transition-colors cursor-pointer"
              title="বিশেষ কিছু আছে এখানে... 🌙"
            >
              <Moon className="w-6 h-6 text-emerald-600" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">শি</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">দ্রুত কাজ</h3>
          <div className="space-y-3">
            <button 
              onClick={handleAttendance}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              হাজিরা নিন
            </button>
            <button 
              onClick={handleGrading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              পরীক্ষার নম্বর দিন
            </button>
            <button 
              onClick={handleHomework}
              className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              গৃহকর্ম দিন
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">সাম্প্রতিক কার্যকলাপ</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                <p className="text-sm text-gray-700">{activity.text}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">এই সপ্তাহের লক্ষ্য</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm text-gray-700">সব দরস সম্পন্ন</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">হিফয পরীক্ষা নেওয়া</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-700">অভিভাবক সাক্ষাৎ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Islamic Learning Subjects */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">আজকের বিষয়সমূহ</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">📖</div>
            <p className="text-sm font-medium text-gray-700">কুরআন তিলাওয়াত</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">🕌</div>
            <p className="text-sm font-medium text-gray-700">ফিকাহ</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm font-medium text-gray-700">আকাইদ</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">📚</div>
            <p className="text-sm font-medium text-gray-700">আরবি ব্যাকরণ</p>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {showAlert && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-40">
          <p className="text-sm">{showAlert}</p>
        </div>
      )}

      {/* Easter Egg Modal */}
      {showEasterEgg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-pulse">
            <div className="mb-4">
              <div className="text-4xl animate-pulse">🌙</div>
              <Sparkles className="w-12 h-12 text-emerald-500 mx-auto animate-spin mt-2" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              🎉 বারাকাল্লাহু ফীক! 🎉
            </h3>
            <p className="text-gray-600 mb-4">
              আল্লাহর রহমতে আপনি আমাদের গোপন বার্তা আবিষ্কার করেছেন! 
            </p>
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-lg">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700 mb-2">
                "তোমাদের মধ্যে সর্বোত্তম সেই ব্যক্তি যে নিজে কুরআন শিক্ষা করে এবং অন্যকে শিক্ষা দেয়।" 
              </p>
              <p className="text-xs text-gray-500 italic">- বুখারী শরীফ</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-emerald-700 font-semibold">
                জাযাকাল্লাহু খাইরান উস্তাদ! 💚
              </p>
            </div>
            <div className="mt-4 flex justify-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 animate-bounce" />
              <Star className="w-5 h-5 text-yellow-500 animate-bounce" style={{animationDelay: '0.1s'}} />
              <Star className="w-5 h-5 text-yellow-500 animate-bounce" style={{animationDelay: '0.2s'}} />
            </div>
          </div>
        </div>
      )}

      {/* Hint for Easter Egg */}
      {clickCount > 0 && clickCount < 5 && !easterEggTriggered && (
        <div className="fixed bottom-4 right-4 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">চাঁদে আরও {5 - clickCount} বার ক্লিক করুন... 🌙</p>
        </div>
      )}
    </div>
  );
}