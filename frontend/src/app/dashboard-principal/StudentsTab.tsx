'use client';
import React, { useState } from 'react';
import { Eye, Trash2, Plus } from 'lucide-react';
import StudentModal, { StudentData } from './StudentModal';

interface StudentsTabProps {
  students: StudentData[];
  setStudents: React.Dispatch<React.SetStateAction<StudentData[]>>;
}

const StudentsTab = ({ students, setStudents }: StudentsTabProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (newStudent: StudentData) => {
    setStudents(prev => [newStudent, ...prev]);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('আপনি কি এই ছাত্র/ছাত্রীটি মুছে ফেলতে চান?')) {
      setStudents(prev => prev.filter(st => st.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">ছাত্র-ছাত্রী তালিকা</h3>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            নতুন ছাত্র/ছাত্রী
          </button>
        </div>

        {students.length === 0 ? (
          <p className="text-center text-gray-500 py-8">কোনো ছাত্র/ছাত্রী পাওয়া যায়নি</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">নাম</th>
                  <th className="px-6 py-3">পিতার নাম</th>
                  <th className="px-6 py-3">ক্লাস</th>
                  <th className="px-6 py-3">মোবাইল</th>
                  <th className="px-6 py-3">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id} className="bg-white border-b">
                    <td className="px-6 py-4">{st.fullName}</td>
                    <td className="px-6 py-4">{st.fatherName}</td>
                    <td className="px-6 py-4">{st.className}</td>
                    <td className="px-6 py-4">{st.phone}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
                      <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(st.id)}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <StudentModal onClose={() => setShowModal(false)} onSubmit={handleAdd} />
      )}
    </div>
  );
};

export default StudentsTab;
