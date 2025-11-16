import React, { useState, useMemo, useEffect } from 'react';
import { LessonPlan, PlanStatus, UserRole } from '../types';
import { STATUS_COLORS, ROLE_LABELS } from '../constants';
import LessonPlanDetailModal from './LessonPlanDetailModal';
import { EyeIcon, DocumentMagnifyingGlassIcon } from './common/Icons';

interface ReviewerDashboardProps {
  plans: LessonPlan[];
  isLoading: boolean;
  onUpdate: () => void;
  showNotification: (message: string) => void;
  currentUserRole: UserRole;
}

const getDefaultStatusForRole = (role: UserRole) => {
    switch (role) {
        case UserRole.DepartmentHead: return PlanStatus.Pending_DeptHead;
        case UserRole.AcademicAffairs: return PlanStatus.Pending_Academic;
        case UserRole.Director: return PlanStatus.Pending_Director;
        default: return '';
    }
};

const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({ plans, isLoading, onUpdate, showNotification, currentUserRole }) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  
  const [filters, setFilters] = useState({
    status: getDefaultStatusForRole(currentUserRole),
    subject: '',
    grade: '',
    teacherName: ''
  });

  // Reset filter when role changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, status: getDefaultStatusForRole(currentUserRole) }));
  }, [currentUserRole]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      return (
        (filters.status ? plan.status === filters.status : true) &&
        (filters.subject ? plan.subject.includes(filters.subject) : true) &&
        (filters.grade ? plan.grade.includes(filters.grade) : true) &&
        (filters.teacherName ? plan.teacherName.includes(filters.teacherName) : true)
      );
    });
  }, [plans, filters]);
  
  const handleView = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setIsDetailModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPlan(null);
  };

  const handleSuccess = (message: string) => {
    handleCloseModal();
    onUpdate();
    showNotification(message);
  };
  
  const uniqueSubjects = useMemo(() => [...new Set(plans.map(p => p.subject))], [plans]);
  const uniqueGrades = useMemo(() => [...new Set(plans.map(p => p.grade))], [plans]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">แผนการสอนทั้งหมด (สำหรับ{ROLE_LABELS[currentUserRole]})</h2>

      {/* --- Filter Section --- */}
      <div className="p-4 bg-white rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">สถานะ</label>
          <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="">ทั้งหมด</option>
            {Object.values(PlanStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">วิชา</label>
          <select id="subject" name="subject" value={filters.subject} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="">ทั้งหมด</option>
            {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
         <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700">ระดับชั้น</label>
          <select id="grade" name="grade" value={filters.grade} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="">ทั้งหมด</option>
            {uniqueGrades.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700">ชื่อครู</label>
          <input type="text" name="teacherName" id="teacherName" value={filters.teacherName} onChange={handleFilterChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="ค้นหาชื่อครู..." />
        </div>
      </div>


      {/* --- Plans Table --- */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="text-center p-10">กำลังโหลดข้อมูล...</div>
          ) : filteredPlans.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อแผนการสอน</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ครูผู้สอน</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{plan.planName}</div>
                      <div className="text-sm text-gray-500">{plan.subject} - {plan.grade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.teacherName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[plan.status]}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button onClick={() => handleView(plan)} className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                        <EyeIcon className="h-5 w-5 mr-1"/> ตรวจ/ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-10 text-gray-500">
              <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">ไม่พบแผนการสอนที่ตรงกับเงื่อนไข</h3>
              <p className="mt-1 text-sm">ลองปรับเปลี่ยนตัวกรองเพื่อค้นหา</p>
            </div>
          )}
        </div>
      </div>
      
      {isDetailModalOpen && selectedPlan && (
        <LessonPlanDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          plan={selectedPlan}
          userRole={currentUserRole}
          onUpdateStatus={handleSuccess}
        />
      )}
    </div>
  );
};

export default ReviewerDashboard;
