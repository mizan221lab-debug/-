import React, { useState } from 'react';
import { LessonPlan, PlanStatus, UserRole, AttachmentType } from '../types';
import { api } from '../services/api';
import { CheckCircleIcon, XCircleIcon, LinkIcon, PhotoIcon, DocumentDuplicateIcon } from './common/Icons';

interface LessonPlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
  userRole: UserRole;
  onUpdateStatus: (message: string) => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">{title}</h3>
    {children}
  </div>
);

const DetailItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="mb-3 grid grid-cols-3 gap-4">
    <dt className="text-sm font-medium text-gray-500 col-span-1">{label}</dt>
    <dd className="text-sm text-gray-900 col-span-2 whitespace-pre-wrap">{value || '-'}</dd>
  </div>
);

const AttachmentIcon: React.FC<{type: AttachmentType}> = ({ type }) => {
    switch (type) {
        case AttachmentType.Document: return <DocumentDuplicateIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />;
        case AttachmentType.Image: return <PhotoIcon className="h-5 w-5 text-green-500 flex-shrink-0" />;
        case AttachmentType.Link: return <LinkIcon className="h-5 w-5 text-purple-500 flex-shrink-0" />;
        default: return <DocumentDuplicateIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />;
    }
};

const LessonPlanDetailModal: React.FC<LessonPlanDetailModalProps> = ({ isOpen, onClose, plan, userRole, onUpdateStatus }) => {
  const [feedback, setFeedback] = useState(plan.reviewerFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStatusUpdate = async (newStatus: PlanStatus, message: string) => {
    setIsSubmitting(true);
    try {
      await api.updateLessonPlanStatus(plan.id, newStatus, feedback);
      onUpdateStatus(message);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = () => {
    let nextStatus: PlanStatus | null = null;
    switch (userRole) {
        case UserRole.DepartmentHead:
            nextStatus = PlanStatus.Pending_Academic;
            break;
        case UserRole.AcademicAffairs:
            nextStatus = PlanStatus.Pending_Director;
            break;
        case UserRole.Director:
            nextStatus = PlanStatus.Approved;
            break;
    }

    if (nextStatus) {
        const message = nextStatus === PlanStatus.Approved ? "อนุมัติแผนเรียบร้อย" : "อนุมัติและส่งต่อแล้ว";
        handleStatusUpdate(nextStatus, message);
    }
  };

  const handleRevision = () => {
    if (!feedback.trim()) {
        alert("กรุณากรอกข้อเสนอแนะก่อนส่งกลับให้ปรับปรุง");
        return;
    }
    handleStatusUpdate(PlanStatus.Revision, "ส่งกลับให้ครูปรับปรุงแล้ว");
  };

  const isReviewer = userRole !== UserRole.Teacher;
  const canTakeAction = 
    (userRole === UserRole.DepartmentHead && plan.status === PlanStatus.Pending_DeptHead) ||
    (userRole === UserRole.AcademicAffairs && plan.status === PlanStatus.Pending_Academic) ||
    (userRole === UserRole.Director && plan.status === PlanStatus.Pending_Director);


  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl h-full max-h-[95vh] rounded-lg shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">รายละเอียดแผนการสอน</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        <div className="overflow-y-auto p-6 flex-grow">
          <DetailSection title="ข้อมูลทั่วไป">
            <DetailItem label="ชื่อแผนการสอน" value={plan.planName} />
            <DetailItem label="ครูผู้สอน" value={plan.teacherName} />
            <DetailItem label="วิชา" value={plan.subject} />
            <DetailItem label="ระดับชั้น" value={plan.grade} />
            <DetailItem label="ภาคเรียน/ปีการศึกษา" value={`${plan.term}/${plan.academicYear}`} />
            <DetailItem label="หน่วยการเรียนรู้" value={plan.unit} />
            <DetailItem label="วันที่สอน" value={new Date(plan.teachingDate).toLocaleDateString('th-TH')} />
          </DetailSection>

          <DetailSection title="เป้าหมายและมาตรฐาน">
            <DetailItem label="มาตรฐาน/ตัวชี้วัด" value={plan.standards} />
            <DetailItem label="จุดประสงค์การเรียนรู้" value={plan.objectives} />
            <DetailItem label="สาระสำคัญ" value={plan.coreConcepts} />
          </DetailSection>

          <DetailSection title="กระบวนการจัดการเรียนรู้ (5 ขั้นตอน)">
            <DetailItem label="ขั้นที่ 1: สร้างความสนใจ" value={plan.step1_engage} />
            <DetailItem label="ขั้นที่ 2: สำรวจและค้นหา" value={plan.step2_explore} />
            <DetailItem label="ขั้นที่ 3: อธิบายความรู้" value={plan.step3_explain} />
            <DetailItem label="ขั้นที่ 4: ขยายความเข้าใจ" value={plan.step4_elaborate} />
            <DetailItem label="ขั้นที่ 5: ประเมินผล" value={plan.step5_evaluate} />
            <DetailItem label="สื่อและแหล่งเรียนรู้" value={plan.media} />
          </DetailSection>

          {plan.attachments && plan.attachments.length > 0 && (
            <DetailSection title="ไฟล์แนบและสื่อการสอน">
                <ul className="space-y-2">
                    {plan.attachments.map(att => (
                        <li key={att.id}>
                           <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-md border transition-colors duration-200">
                                <AttachmentIcon type={att.type} />
                                <div>
                                    <p className="text-sm font-medium text-blue-600 hover:underline">{att.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{att.fileName || att.url}</p>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </DetailSection>
          )}

          <DetailSection title="การวัดและประเมินผล">
            <DetailItem label="วิธีการประเมิน" value={plan.assessmentMethods} />
            <DetailItem label="เครื่องมือประเมิน" value={plan.assessmentTools} />
            <DetailItem label="เกณฑ์การประเมิน" value={plan.assessmentCriteria} />
          </DetailSection>

          {(plan.teacherNotes) && (
            <DetailSection title="บันทึกเพิ่มเติมของครู">
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{plan.teacherNotes}</p>
            </DetailSection>
          )}

          {isReviewer && (
            <div className="mt-6">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">ข้อเสนอแนะ / ความคิดเห็น</label>
              <textarea
                id="feedback"
                name="feedback"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={canTakeAction ? "กรอกความคิดเห็นที่นี่..." : "ไม่สามารถแก้ไขได้ในขั้นตอนนี้"}
                readOnly={!canTakeAction}
              />
            </div>
          )}
          
          {!isReviewer && plan.reviewerFeedback && (
            <DetailSection title="ความคิดเห็นจากผู้ตรวจ">
              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-200">{plan.reviewerFeedback}</p>
            </DetailSection>
          )}

        </div>
        <div className="flex justify-end items-center p-4 border-t space-x-3 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} disabled={isSubmitting} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
            ปิด
          </button>
          {isReviewer && canTakeAction && (
            <>
              <button
                onClick={handleRevision}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-yellow-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50"
              >
                <XCircleIcon className="mr-2 h-5 w-5" />
                {isSubmitting ? 'กำลังส่ง...' : 'ส่งกลับให้ปรับปรุง'}
              </button>
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <CheckCircleIcon className="mr-2 h-5 w-5" />
                {isSubmitting ? 'กำลังดำเนินการ...' : (userRole === UserRole.Director ? 'อนุมัติแผน' : 'อนุมัติและส่งต่อ')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanDetailModal;