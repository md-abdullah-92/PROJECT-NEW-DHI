'use client'
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Bell, 
  BarChart3, 
  Search,
  Plus,
  Settings,
  LogOut,
  Home,
  GraduationCap,
  ClipboardList,
  MessageSquare,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react';
import Link from "next/link";

import { useRouter } from "next/navigation";

const PrincipalDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  type Student = {
    _id: string;
    fullNameBangla?: string;
    fullName?: string;
    class?: string;
    roll?: string;
    guardianName?: string;
    guardianContact?: string;
    lastResult?: string;
  };
  
  type Teacher = {
    id: string;
    name: string;
    phone?: string;
    teacherData?: {
      subjectsTaught?: string[];
      experienceYears?: number;
    };
  };
  
  type Class = {
    // Define class properties if needed
  };
  
  const [data, setData] = useState<{ students: Student[]; teachers: Teacher[]; classes: Class[] }>({ students: [], teachers: [], classes: [] });
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalClasses: 0, pendingResults: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userAuth');
    router.push('/login');
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, teachersRes, classesRes] = await Promise.all([
        api.get('/students'),
        api.get('/teachers'),
        api.get('/classes'),
      ]);

      setData({
        students: studentsRes.data?.data || [],
        teachers: teachersRes.data?.data || [],
        classes: classesRes.data?.data || [],
      });

      setStats({
        totalStudents: studentsRes.data?.count || 0,
        totalTeachers: teachersRes.data?.count || 0,
        totalClasses: classesRes.data?.count || 0,
        pendingResults: 12, // Placeholder
      });

    } catch (err) {
      console.error('Fetch error:', err);
      // Fallback to default/empty state
      setStats({ 
        totalStudents: 0, 
        totalTeachers: 0, 
        totalClasses: 0, 
        pendingResults: 0 
      });
      setData({ students: [], teachers: [], classes: [] });
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const recentResults = [
    { id: 1, student: 'মোহাম্মদ আহমেদ', class: 'দশম', exam: 'মাসিক পরীক্ষা', result: 'A+', date: '২০২৫-০৭-০৮' },
    { id: 2, student: 'ফাতিমা খাতুন', class: 'নবম', exam: 'সাপ্তাহিক পরীক্ষা', result: 'A', date: '২০২৫-০৭-০৭' },
    { id: 3, student: 'আবু বকর সিদ্দিক', class: 'অষ্টম', exam: 'মাসিক পরীক্ষা', result: 'A+', date: '২০২৫-০৭-০৬' }
  ];

  const Sidebar = () => (
    <div className="w-64 bg-gradient-to-b from-green-700 to-green-800 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-green-600">
        <h2 className="text-xl font-bold text-center">দারুল হিকমাহ ইনস্টিটিউট</h2>
        <p className="text-green-200 text-center text-sm mt-1">প্রিন্সিপাল প্যানেল</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 py-2">
          <p className="text-green-200 text-xs uppercase font-semibold">মূল মেনু</p>
        </div>
        
        {[
          { id: 'overview', label: 'ওভারভিউ', icon: Home },
          { id: 'students', label: 'শিক্ষার্থী তথ্য', icon: Users },
          { id: 'teachers', label: 'শিক্ষক তথ্য', icon: GraduationCap },
          { id: 'results', label: 'পরীক্ষার ফলাফল', icon: BarChart3 },
          { id: 'reports', label: 'রিপোর্ট', icon: FileText },
          { id: 'notices', label: 'নোটিশ', icon: Bell },
          { id: 'settings', label: 'সেটিংস', icon: Settings }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-green-600 transition-colors ${
              activeTab === item.id ? 'bg-green-600 border-r-4 border-white' : ''
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-green-600">
        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-left hover:bg-green-600 transition-colors">
          <LogOut className="w-5 h-5 mr-3" />
          লগ আউট
        </button>
      </div>
    </div>
  );

  type StatCardProps = {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
  };

    const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
          return (
              <div className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${color}`}>
              <div className="flex items-center justify-between">
                  <div>
                  <p className="text-sm text-gray-600">{title}</p>
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  </div>
                  {Icon && <Icon
                  className="w-10 h-10 text-gray-400" />}
              </div>
              </div>
          );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="মোট শিক্ষার্থী" value={stats.totalStudents} icon={Users} color="border-blue-500" />
        <StatCard title="মোট শিক্ষক" value={stats.totalTeachers} icon={GraduationCap} color="border-green-500" />
        <StatCard title="মোট ক্লাস" value={stats.totalClasses} icon={BookOpen} color="border-purple-500" />
        <StatCard title="পেন্ডিং রেজাল্ট" value={stats.pendingResults} icon={ClipboardList} color="border-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">সাম্প্রতিক ফলাফল</h3>
          <div className="space-y-3">
            {recentResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{result.student}</p>
                  <p className="text-sm text-gray-600">{result.class} - {result.exam}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{result.result}</p>
                  <p className="text-xs text-gray-500">{result.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">দ্রুত অ্যাকশন</h3>
          <div className="space-y-3">
      <Link href="/new-student-add">
        <button className="w-full flex items-center justify-center bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          নতুন শিক্ষার্থী যোগ করুন
        </button>
      </Link>
            <button 
              onClick={() => setShowNoticeModal(true)}
              className="w-full flex items-center justify-center bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Bell className="w-5 h-5 mr-2" />
              নোটিশ পাঠান
            </button>
            <button className="w-full flex items-center justify-center bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors">
              <Download className="w-5 h-5 mr-2" />
              রিপোর্ট ডাউনলোড
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  const TeachersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">শিক্ষক তথ্য</h2>
         <button
            onClick={() => router.push('/new-teacher-add')}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            নতুন শিক্ষক
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.teachers.map((teacher: any) => (
            <div key={teacher.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-800">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{teacher.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{teacher.teacherData?.subjectsTaught.join(', ') || 'N/A'}</p>
              <p className="text-sm text-gray-500 mb-2">{teacher.phone}</p>
              <p className="text-xs text-green-600 font-medium">{teacher.teacherData?.experienceYears || 0} বছর</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ResultsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">পরীক্ষার ফলাফল</h2>
          <div className="flex space-x-2">
            <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              ফলাফল আপলোড
            </button>
            <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              নতুন পরীক্ষা
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">সম্পূর্ণ ফলাফল</h3>
            <p className="text-2xl font-bold">৮৫%</p>
          </div>
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">পেন্ডিং</h3>
            <p className="text-2xl font-bold">১২</p>
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">গড় নম্বর</h3>
            <p className="text-2xl font-bold">৮৭.৫</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">শিক্ষার্থী</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">শ্রেণী</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">পরীক্ষা</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ফলাফল</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">তারিখ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {recentResults.map((result) => (
                <tr key={result.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{result.student}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{result.class}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{result.exam}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      result.result === 'A+' ? 'bg-green-100 text-green-800' :
                      result.result === 'A' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{result.date}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-800">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const NoticesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">নোটিশ বোর্ড</h2>
          <button 
            onClick={() => setShowNoticeModal(true)}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            নতুন নোটিশ
          </button>
        </div>

        <div className="space-y-4">
          {[
            { id: 1, title: 'বার্ষিক পরীক্ষার সময়সূচী', date: '২০২৫-০৭-১০', type: 'জরুরি' },
            { id: 2, title: 'নতুন শিক্ষাবর্ষের ভর্তি', date: '২০২৫-০৭-০৮', type: 'সাধারণ' },
            { id: 3, title: 'শিক্ষক সভা', date: '২০২৫-০৭-০৫', type: 'সভা' }
          ].map((notice) => (
            <div key={notice.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{notice.title}</h3>
                  <p className="text-sm text-gray-600">{notice.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    notice.type === 'জরুরি' ? 'bg-red-100 text-red-800' :
                    notice.type === 'সভা' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {notice.type}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-800">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const NoticeModal = () => {
    if (!showNoticeModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">নতুন নোটিশ পাঠান</h3>
          <textarea
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            placeholder="নোটিশের বিষয়বস্তু লিখুন..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowNoticeModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              বাতিল
            </button>
            <button
              onClick={() => {
                // Handle send notice logic here
                setShowNoticeModal(false);
                setNoticeText('');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              পাঠান
            </button>
          </div>
        </div>
      </div>
    );
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
  return (
    <div className="flex justify-center items-center h-full">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    </div>
  );
}


    return renderActiveTab();
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'students':
        return <StudentsTab />;
      case 'teachers':
        return <TeachersTab />;
      case 'results':
        return <ResultsTab />;
      case 'notices':
        return <NoticesTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
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

        {renderContent()}
      </div>
      
      <NoticeModal />
    </div>
  );
};

  {/*Time Function*/}
  export default PrincipalDashboard;
  function getBengaliDate(): React.ReactNode {
    // Bengali months
    const months = [
      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];
    // Bengali digits
    const bnDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

    // Convert English digits to Bengali
    const toBengaliNumber = (num: number | string) =>
      String(num).split('').map(d => /\d/.test(d) ? bnDigits[Number(d)] : d).join('');

    const now = new Date();
    const day = toBengaliNumber(now.getDate());
    const month = months[now.getMonth()];
    const year = toBengaliNumber(now.getFullYear());

    return `${day} ${month}, ${year}`;
  }
