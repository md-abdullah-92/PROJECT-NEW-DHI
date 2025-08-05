'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/dashboard-principal/Sidebar';
import OverviewTab from '@/app/dashboard-principal/OverviewTab';
import StudentsTab from '@/app/dashboard-principal/StudentsTab';
import TeachersTab from '@/app/dashboard-principal/TeachersTab';
import ResultsTab from '@/app/dashboard-principal/ResultsTab';
import NoticesTab from '@/app/dashboard-principal/NoticesTab';
import NoticeModal from '@/app/dashboard-principal/NoticeModal';
import { toast } from 'react-hot-toast';

export default function PrincipalDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [notices, setNotices] = useState([
  {
    id: 1,
    title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
    content: 'আগামী ২৫শে আগস্ট, ২০২৫ তারিখে প্রতিষ্ঠানের বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হবে।',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    type: 'info'
  },
  {
    id: 2,
    title: 'অভিভাবক সমাবেশ',
    content: 'সকল শিক্ষার্থীদের অভিভাবকদের নিয়ে একটি সমাবেশ অনুষ্ঠিত হবে আগামী শুক্রবার।',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    type: 'warning'
  },
  {
    id: 3,
    title: 'ছুটি ঘোষণা',
    content: 'ঈদ-উল-মিলাদুন্নবী (সা.) উপলক্ষে আগামী সোমবার প্রতিষ্ঠান বন্ধ থাকবে।',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    type: 'success'
  },
  {
    id: 4,
    title: 'পরীক্ষার সময়সূচি প্রকাশ',
    content: 'অর্ধবার্ষিক পরীক্ষার সময়সূচি প্রকাশিত হয়েছে। অনুগ্রহ করে নোটিশ বোর্ডে দেখে নিন।',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    type: 'info'
  },
  {
    id: 5,
    title: 'শ্রেণিকক্ষ রক্ষণাবেক্ষণ',
    content: 'আগামীকাল শ্রেণিকক্ষগুলোতে পরিষ্কার-পরিচ্ছন্নতা কার্যক্রম চলবে, সকল শিক্ষার্থীকে সচেতন থাকতে বলা হলো।',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    type: 'warning'
  }
]);

  const [results, setResults] = useState([
  {
    id: 1,
    student: 'আবু বকর সিদ্দিক',
    className: 'দ্বিতীয় জামাত',
    exam: 'মাসিক পরীক্ষা',
    grade: 'A+'
  },
  {
    id: 2,
    student: 'ফাতিমা বিনতে মুহাম্মদ',
    className: 'তৃতীয় জামাত',
    exam: 'ত্রৈমাসিক পরীক্ষা',
    grade: 'A'
  },
  {
    id: 3,
    student: 'মুহাম্মদ আল আমিন',
    className: 'চতুর্থ জামাত',
    exam: 'অর্ধবার্ষিক পরীক্ষা',
    grade: 'B+'
  },
  {
    id: 4,
    student: 'রহিমা খাতুন',
    className: 'হিফজ বিভাগ',
    exam: 'অগ্রগতির পরীক্ষা',
    grade: 'A'
  },
  {
    id: 5,
    student: 'তানভীর হাসান',
    className: 'পঞ্চম জামাত',
    exam: 'মাসিক পরীক্ষা',
    grade: 'A+'
  },
  {
    id: 6,
    student: 'সুমাইয়া আক্তার',
    className: 'ছয় নম্বর জামাত',
    exam: 'ত্রৈমাসিক পরীক্ষা',
    grade: 'A'
  },
  {
    id: 7,
    student: 'আব্দুল করিম',
    className: 'মুত্তাওয়াসসিতাহ',
    exam: 'বার্ষিক পরীক্ষা',
    grade: 'B'
  },
  {
    id: 8,
    student: 'জয়নাব বিনতে আবু তালেব',
    className: 'সানাবিয়া উলা',
    exam: 'মধ্যবর্তী পরীক্ষা',
    grade: 'A+'
  }
]);
const [students, setStudents] = useState([
  {
    id: 1,
    fullName: 'মুহাম্মদ আরিফুল ইসলাম',
    fatherName: 'মোঃ সাইফুল ইসলাম',
    className: 'তৃতীয় জামাত',
    phone: '01711223344'
  },
  {
    id: 2,
    fullName: 'ফারজানা আক্তার',
    fatherName: 'মোঃ আবুল কালাম',
    className: 'দ্বিতীয় জামাত',
    phone: '01899887766'
  },
  {
    id: 3,
    fullName: 'হাফিজ তানভীর আহমেদ',
    fatherName: 'মাওলানা রশীদুল ইসলাম',
    className: 'হিফজ বিভাগ',
    phone: '01911224455'
  },
  {
    id: 4,
    fullName: 'সাদিয়া বিনতে রশিদ',
    fatherName: 'মোঃ রফিকুল ইসলাম',
    className: 'সানাবিয়া উলা',
    phone: '01677665544'
  },
  {
    id: 5,
    fullName: 'জয়নুল আবেদিন',
    fatherName: 'হাফেজ মজিবুর রহমান',
    className: 'মুত্তাওয়াসসিতাহ',
    phone:'01733445566'
  }
]);

const [teachers, setTeachers] = useState([
  {
    id: 1,
    name: 'মোঃ আব্দুল্লাহ',
    position: 'প্রধান শিক্ষক',
    contact: '01712345678'
  },
  {
    id: 2,
    name: 'মাওলানা রাশেদুল ইসলাম',
    position: 'সহকারী প্রধান শিক্ষক',
    contact: '01811223344'
  },
  {
    id: 3,
    name: 'হাফেজ মিজানুর রহমান',
    position: 'হিফজ বিভাগের শিক্ষক',
    contact: '01699887766'
  },
  {
    id: 4,
    name: 'মাওলানা খালিদ বিন ওয়ালিদ',
    position: 'আকায়েদ ও ফিকহ',
    contact: '01987654321'
  },
  {
    id: 5,
    name: 'উস্তাদা শামিমা আক্তার',
    position: 'নারী বিভাগের ইনচার্জ',
    contact: '01755443322'
  },
  {
    id: 6,
    name: 'মাওলানা আবু বকর সিদ্দিক',
    position: 'তাফসির ও হাদীস',
    contact: '01876543210'
  },
  {
    id: 7,
    name: 'হাফেজা সায়মা বিনতে তাহের',
    position: 'হিফজ (নারী বিভাগ)',
    contact: '01912345678'
  }
]);


  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingResults: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    // Simulate fetching stats
    setTimeout(() => {
      setStats({
        totalStudents: 150,
        totalTeachers: 15,
        totalClasses: 10,
        pendingResults: 12
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userAuth');
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-700"></div>
        </div>
      );
    }
    if (error) {
      return <div className="text-red-500">Error: {error}</div>;
    }
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} setActiveTab={setActiveTab} />;
      case 'students':
        return <StudentsTab students={students} setStudents={setStudents} />;
     case 'teachers':
  return <TeachersTab teachers={teachers} setTeachers={setTeachers} />;

      case 'results': return <ResultsTab results={results} setResults={setResults} />;

      case 'notices':
        return (
          <NoticesTab
            notices={notices}
            setNotices={setNotices}
            setShowModal={setShowNoticeModal}
          />
        );
      default:
        return <OverviewTab stats={stats} setActiveTab={setActiveTab} />;
    }
  };

  const getBengaliDate = () => {
    const months = [
      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    const toBengaliNumber = (num: number | string) =>
      String(num)
        .split('')
        .map(d => /\d/.test(d) ? bnDigits[Number(d)] : d)
        .join('');

    const now = new Date();
    return `${toBengaliNumber(now.getDate())} ${months[now.getMonth()]}, ${toBengaliNumber(now.getFullYear())}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      {/* Header */}
      <div className="ml-64 p-6">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">দারুল হিকমাহ ইনস্টিটিউট</h1>
              <p className="text-gray-600">প্রিন্সিপাল প্রশাসনিক প্যানেল</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">আজকের তারিখ</p>
                <p className="font-semibold text-gray-800">{getBengaliDate()}</p>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">প্র</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Notice Button (only in notices tab) */}
        {activeTab === 'notices' && (
          <div className="pb-4 flex justify-end">
            <button
              onClick={() => setShowNoticeModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
            >
              <span className="mr-2">➕</span>
              নতুন নোটিশ
            </button>
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </div>

      {/* Notice Modal */}
      {showNoticeModal && (
        <NoticeModal
          onClose={() => setShowNoticeModal(false)}
          onSubmit={(title, content) => {
            const newNotice = {
              id: Date.now(),
              title,
              content,
              date: new Date(),
              type: 'info'
            };
            setNotices([newNotice, ...notices]);
            setShowNoticeModal(false);
          }}
        />
      )}
    </div>
  );
}
