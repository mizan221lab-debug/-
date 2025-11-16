import React, { useState, useEffect } from 'react';
import { LessonPlan, PlanStatus, Attachment, AttachmentType } from '../types';
import { api } from '../services/api';
import { SparklesIcon, TrashIcon, LinkIcon, PhotoIcon, DocumentDuplicateIcon, PlusIcon } from './common/Icons';

interface LessonPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan | null;
  onSuccess: (message: string) => void;
  teacherId: string;
  teacherName: string;
}

const emptyPlan: Omit<LessonPlan, 'id' | 'status' | 'teacherId' | 'teacherName' | 'createdAt' | 'updatedAt' | 'reviewerFeedback' | 'attachments'> = {
  planName: '',
  subject: '',
  grade: '',
  term: '',
  academicYear: '',
  unit: '',
  duration: '',
  teachingDate: '',
  standards: '',
  objectives: '',
  coreConcepts: '',
  step1_engage: '',
  step2_explore: '',
  step3_explain: '',
  step4_elaborate: '',
  step5_evaluate: '',
  grouping: '',
  media: '',
  homework: '',
  assessmentMethods: '',
  assessmentTools: '',
  assessmentCriteria: '',
  teacherNotes: '',
};

const emptyAttachment = {
    name: '',
    type: AttachmentType.Document,
    url: '',
    file: null as File | null,
};

const LessonPlanFormModal: React.FC<LessonPlanFormModalProps> = ({ isOpen, onClose, plan, onSuccess, teacherId, teacherName }) => {
  const [formData, setFormData] = useState(emptyPlan);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachment, setNewAttachment] = useState(emptyAttachment);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);

  useEffect(() => {
    if (plan) {
      const { id, status, createdAt, updatedAt, reviewerFeedback, attachments: planAttachments, ...rest } = plan;
      setFormData(rest);
      setAttachments(planAttachments || []);
    } else {
      setFormData(emptyPlan);
      setAttachments([]);
    }
    setAiFeedback(null); // Reset AI feedback
    setNewAttachment(emptyAttachment); // Reset new attachment form
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if(errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
    }
  };
  
  const handleNewAttachmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAttachment(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setNewAttachment(prev => ({ ...prev, file, url: URL.createObjectURL(file) }));
    }
  };
  
  const handleAddAttachment = () => {
    if (!newAttachment.name) {
        alert('กรุณากรอกชื่อไฟล์แนบ');
        return;
    }
    if (newAttachment.type === AttachmentType.Link && !newAttachment.url) {
        alert('กรุณากรอก URL');
        return;
    }
    if ((newAttachment.type === AttachmentType.Document || newAttachment.type === AttachmentType.Image) && !newAttachment.file) {
        alert('กรุณาเลือกไฟล์');
        return;
    }

    const newAtt: Attachment = {
        id: `temp-${Date.now()}`,
        type: newAttachment.type,
        name: newAttachment.name,
        url: newAttachment.type === AttachmentType.Link ? newAttachment.url : newAttachment.url,
        fileName: newAttachment.file ? newAttachment.file.name : undefined,
    };
    setAttachments(prev => [...prev, newAtt]);
    setNewAttachment(emptyAttachment);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };


  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.planName) newErrors.planName = 'กรุณากรอกชื่อแผนการสอน';
    if (!formData.subject) newErrors.subject = 'กรุณากรอกชื่อวิชา';
    if (!formData.grade) newErrors.grade = 'กรุณากรอกระดับชั้น';
    if (!formData.teachingDate) newErrors.teachingDate = 'กรุณาเลือกวันที่สอน';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (targetStatus: PlanStatus) => {
    if (targetStatus !== PlanStatus.Draft && !validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = { ...formData, attachments, teacherId, teacherName, status: targetStatus };
      if (plan) {
        await api.updateLessonPlan(plan.id, dataToSave);
      } else {
        await api.createLessonPlan(dataToSave);
      }
      const message = targetStatus === PlanStatus.Draft ? 'บันทึกฉบับร่างสำเร็จ' : 'ส่งแผนเพื่อตรวจแล้ว';
      onSuccess(message);
    } catch (error) {
      console.error('Failed to save lesson plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiCheck = async () => {
    setIsAnalyzing(true);
    setAiFeedback(null);
    try {
        const feedback = await api.analyzeLessonPlanSteps(
            formData.planName,
            formData.subject,
            {
                step1_engage: formData.step1_engage,
                step2_explore: formData.step2_explore,
                step3_explain: formData.step3_explain,
                step4_elaborate: formData.step4_elaborate,
                step5_evaluate: formData.step5_evaluate,
            }
        );
        setAiFeedback(feedback);
    } catch(err) {
        setAiFeedback({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI' });
    } finally {
        setIsAnalyzing(false);
    }
  }

  const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );

  const FormField: React.FC<{ name: string; label: string; required?: boolean; children: React.ReactNode; className?: string }> = ({ name, label, required, children, className }) => (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1">{children}</div>
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );
  
  const AiFeedback: React.FC<{ content: string }> = ({ content }) => (
    <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded-r-md">
        <div className="flex items-start">
            <SparklesIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
            <div>
                <p className="font-semibold">ข้อเสนอแนะจาก AI</p>
                <p className="whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    </div>
  );

  const Input = (props: React.ComponentProps<'input'>) => (
    <input {...props} className={`block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors[props.name || ''] ? 'border-red-500' : ''}`} />
  );

  const Textarea = (props: React.ComponentProps<'textarea'>) => (
    <textarea {...props} rows={5} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
  );

  const AttachmentIcon: React.FC<{type: AttachmentType}> = ({ type }) => {
    switch (type) {
        case AttachmentType.Document: return <DocumentDuplicateIcon className="h-5 w-5 text-blue-500" />;
        case AttachmentType.Image: return <PhotoIcon className="h-5 w-5 text-green-500" />;
        case AttachmentType.Link: return <LinkIcon className="h-5 w-5 text-purple-500" />;
        default: return <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 w-full max-w-5xl h-full max-h-[95vh] rounded-lg shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-lg sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">{plan ? 'แก้ไขแผนการสอน' : 'สร้างแผนการสอนใหม่'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        <div className="overflow-y-auto p-6 space-y-6 flex-grow">
          <FormSection title="ข้อมูลทั่วไป">{/* ... fields ... */}</FormSection>
          <FormSection title="เป้าหมายและมาตรฐาน">{/* ... fields ... */}</FormSection>
          <FormSection title="กระบวนการจัดการเรียนรู้ (Active Learning 5 ขั้นตอน)">{/* ... fields ... */}</FormSection>
          
           {/* --- Attachments Section --- */}
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">ไฟล์แนบและสื่อการสอน</h3>
             <div className="space-y-4">
               {/* List of existing attachments */}
               {attachments.length > 0 && (
                 <ul className="space-y-2">
                   {attachments.map(att => (
                     <li key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border">
                       <div className="flex items-center gap-3">
                         <AttachmentIcon type={att.type} />
                         <div>
                           <p className="text-sm font-medium text-gray-800">{att.name}</p>
                           <p className="text-xs text-gray-500 truncate max-w-xs">{att.fileName || att.url}</p>
                         </div>
                       </div>
                       <button onClick={() => handleRemoveAttachment(att.id)} className="text-red-500 hover:text-red-700">
                         <TrashIcon className="h-5 w-5" />
                       </button>
                     </li>
                   ))}
                 </ul>
               )}

               {/* Form to add new attachment */}
               <div className="p-4 border border-dashed rounded-lg space-y-3">
                 <h4 className="font-semibold text-gray-700">เพิ่มไฟล์แนบใหม่</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="text-sm font-medium text-gray-700">ชื่อสื่อ</label>
                     <Input type="text" name="name" value={newAttachment.name} onChange={handleNewAttachmentChange} placeholder="เช่น ใบงานที่ 1" />
                   </div>
                   <div>
                     <label className="text-sm font-medium text-gray-700">ประเภท</label>
                     <select name="type" value={newAttachment.type} onChange={handleNewAttachmentChange} className="block w-full mt-1 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                       {Object.values(AttachmentType).map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                   </div>
                   <div className="md:col-span-3">
                     {newAttachment.type === AttachmentType.Link ? (
                       <div>
                         <label className="text-sm font-medium text-gray-700">URL</label>
                         <Input type="text" name="url" value={newAttachment.url} onChange={handleNewAttachmentChange} placeholder="https://example.com" />
                       </div>
                     ) : (
                       <div>
                         <label className="text-sm font-medium text-gray-700">เลือกไฟล์</label>
                         <input type="file" onChange={handleFileChange}
                            accept={newAttachment.type === AttachmentType.Image ? 'image/*' : '.pdf,.doc,.docx,.ppt,.pptx'}
                            className="block w-full text-sm text-gray-500 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                         />
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="text-right">
                   <button onClick={handleAddAttachment} type="button" className="inline-flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-200">
                     <PlusIcon className="h-5 w-5" /> เพิ่ม
                   </button>
                 </div>
               </div>
             </div>
           </div>


          <FormSection title="การวัดและประเมินผล">{/* ... fields ... */}</FormSection>
          <FormSection title="หมายเหตุเพิ่มเติม">{/* ... fields ... */}</FormSection>

        </div>
        <div className="flex justify-end items-center p-4 border-t bg-white rounded-b-lg space-x-3 sticky bottom-0 z-10">
          <button onClick={onClose} disabled={isSubmitting} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">ยกเลิก</button>
          <button onClick={() => handleSubmit(PlanStatus.Draft)} disabled={isSubmitting} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50">บันทึกฉบับร่าง</button>
          <button onClick={() => handleSubmit(PlanStatus.Pending_DeptHead)} disabled={isSubmitting || isAnalyzing} className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'กำลังบันทึก...' : (plan?.status === PlanStatus.Revision ? 'ส่งตรวจอีกครั้ง' : 'ส่งตรวจ')}
          </button>
        </div>
      </div>
    </div>
  );
};


// Re-adding the full component content to avoid truncation issues
const FullLessonPlanFormModal: React.FC<LessonPlanFormModalProps> = (props) => {
    const { isOpen, onClose, plan, onSuccess, teacherId, teacherName } = props;
    const [formData, setFormData] = useState(emptyPlan);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [newAttachment, setNewAttachment] = useState(emptyAttachment);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<any>(null);

    useEffect(() => {
        if (plan) {
            const { id, status, createdAt, updatedAt, reviewerFeedback, attachments: planAttachments, ...rest } = plan;
            setFormData(rest);
            setAttachments(planAttachments || []);
        } else {
            setFormData(emptyPlan);
            setAttachments([]);
        }
        setAiFeedback(null);
        setNewAttachment(emptyAttachment);
    }, [plan, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleNewAttachmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAttachment(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewAttachment(prev => ({ ...prev, file, url: URL.createObjectURL(file) }));
        }
    };

    const handleAddAttachment = () => {
        if (!newAttachment.name.trim()) { alert('กรุณากรอกชื่อสื่อ'); return; }
        if (newAttachment.type === AttachmentType.Link && !newAttachment.url.trim()) { alert('กรุณากรอก URL'); return; }
        if ((newAttachment.type === AttachmentType.Document || newAttachment.type === AttachmentType.Image) && !newAttachment.file) { alert('กรุณาเลือกไฟล์'); return; }

        const newAtt: Attachment = {
            id: `temp-${Date.now()}`,
            type: newAttachment.type,
            name: newAttachment.name,
            url: newAttachment.type === AttachmentType.Link ? newAttachment.url : newAttachment.url,
            fileName: newAttachment.file ? newAttachment.file.name : undefined,
        };
        setAttachments(prev => [...prev, newAtt]);
        setNewAttachment(emptyAttachment);
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleRemoveAttachment = (id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.planName) newErrors.planName = 'กรุณากรอกชื่อแผนการสอน';
        if (!formData.subject) newErrors.subject = 'กรุณากรอกชื่อวิชา';
        if (!formData.grade) newErrors.grade = 'กรุณากรอกระดับชั้น';
        if (!formData.teachingDate) newErrors.teachingDate = 'กรุณาเลือกวันที่สอน';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (targetStatus: PlanStatus) => {
        if (targetStatus !== PlanStatus.Draft && !validate()) return;
        setIsSubmitting(true);
        try {
            const dataToSave = { ...formData, attachments, teacherId, teacherName, status: targetStatus };
            if (plan) {
                await api.updateLessonPlan(plan.id, dataToSave);
            } else {
                await api.createLessonPlan(dataToSave);
            }
            onSuccess(targetStatus === PlanStatus.Draft ? 'บันทึกฉบับร่างสำเร็จ' : 'ส่งแผนเพื่อตรวจแล้ว');
        } catch (error) {
            console.error('Failed to save lesson plan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAiCheck = async () => {
        setIsAnalyzing(true);
        setAiFeedback(null);
        try {
            const feedback = await api.analyzeLessonPlanSteps(formData.planName, formData.subject, {
                step1_engage: formData.step1_engage,
                step2_explore: formData.step2_explore,
                step3_explain: formData.step3_explain,
                step4_elaborate: formData.step4_elaborate,
                step5_evaluate: formData.step5_evaluate,
            });
            setAiFeedback(feedback);
        } catch (err) {
            setAiFeedback({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI' });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    // Components
    const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
        </div>
    );
    const FormField: React.FC<{ name: string; label: string; required?: boolean; children: React.ReactNode; className?: string }> = ({ name, label, required, children, className }) => (
        <div className={className}><label htmlFor={name} className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label><div className="mt-1">{children}</div>{errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}</div>
    );
    const AiFeedback: React.FC<{ content: string }> = ({ content }) => (<div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded-r-md"><div className="flex items-start"><SparklesIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" /><div><p className="font-semibold">ข้อเสนอแนะจาก AI</p><p className="whitespace-pre-wrap">{content}</p></div></div></div>);
    const Input = (props: React.ComponentProps<'input'>) => (<input {...props} className={`block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors[props.name || ''] ? 'border-red-500' : ''}`} />);
    const Textarea = (props: React.ComponentProps<'textarea'>) => (<textarea {...props} rows={5} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />);
    const AttachmentIcon: React.FC<{ type: AttachmentType }> = ({ type }) => {
        switch (type) {
            case AttachmentType.Document: return <DocumentDuplicateIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />;
            case AttachmentType.Image: return <PhotoIcon className="h-5 w-5 text-green-500 flex-shrink-0" />;
            case AttachmentType.Link: return <LinkIcon className="h-5 w-5 text-purple-500 flex-shrink-0" />;
            default: return <DocumentDuplicateIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />;
        }
    };
    
    return (
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 w-full max-w-5xl h-full max-h-[95vh] rounded-lg shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-lg sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">{plan ? 'แก้ไขแผนการสอน' : 'สร้างแผนการสอนใหม่'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        <div className="overflow-y-auto p-6 space-y-6 flex-grow">
          <FormSection title="ข้อมูลทั่วไป">
            <FormField name="planName" label="ชื่อแผนการสอน" required className="md:col-span-2"><Input type="text" name="planName" value={formData.planName} onChange={handleChange} /></FormField>
            <FormField name="subject" label="วิชา" required><Input type="text" name="subject" value={formData.subject} onChange={handleChange} /></FormField>
            <FormField name="grade" label="ระดับชั้น" required><Input type="text" name="grade" value={formData.grade} onChange={handleChange} /></FormField>
            <FormField name="term" label="ภาคเรียน"><Input type="text" name="term" value={formData.term} onChange={handleChange} /></FormField>
            <FormField name="academicYear" label="ปีการศึกษา"><Input type="text" name="academicYear" value={formData.academicYear} onChange={handleChange} /></FormField>
            <FormField name="unit" label="หน่วยการเรียนรู้/เรื่อง" className="md:col-span-2"><Input type="text" name="unit" value={formData.unit} onChange={handleChange} /></FormField>
            <FormField name="duration" label="จำนวนคาบ/เวลา"><Input type="text" name="duration" value={formData.duration} onChange={handleChange} /></FormField>
            <FormField name="teachingDate" label="วันที่สอน" required><Input type="date" name="teachingDate" value={formData.teachingDate} onChange={handleChange} /></FormField>
          </FormSection>

          <FormSection title="เป้าหมายและมาตรฐาน">
            <FormField name="standards" label="มาตรฐาน/ตัวชี้วัด" className="md:col-span-2"><Textarea name="standards" value={formData.standards} onChange={handleChange} /></FormField>
            <FormField name="objectives" label="จุดประสงค์การเรียนรู้" className="md:col-span-2"><Textarea name="objectives" value={formData.objectives} onChange={handleChange} /></FormField>
            <FormField name="coreConcepts" label="สาระสำคัญ/แกนกลาง" className="md:col-span-2"><Textarea name="coreConcepts" value={formData.coreConcepts} onChange={handleChange} /></FormField>
          </FormSection>

          <FormSection title="กระบวนการจัดการเรียนรู้ (Active Learning 5 ขั้นตอน)">
              <div className="md:col-span-2 flex justify-between items-center">
                  <p className="text-sm text-gray-600">กรอกรายละเอียดกิจกรรมในแต่ละขั้นตอน และกดปุ่มเพื่อรับข้อเสนอแนะจาก AI</p>
                  <button type="button" onClick={handleAiCheck} disabled={isAnalyzing} className="inline-flex items-center gap-2 rounded-md bg-purple-100 px-3 py-2 text-sm font-semibold text-purple-700 shadow-sm hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <SparklesIcon className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      {isAnalyzing ? 'กำลังวิเคราะห์...' : 'ตรวจสอบด้วย AI'}
                  </button>
              </div>
              {aiFeedback?.overall_summary && <div className="md:col-span-2"><AiFeedback content={aiFeedback.overall_summary}/></div>}
              <FormField name="step1_engage" label="ขั้นที่ 1: สร้างความสนใจ (Engage)" className="md:col-span-2"><Textarea name="step1_engage" value={formData.step1_engage} onChange={handleChange} />{aiFeedback?.step1_feedback && <AiFeedback content={aiFeedback.step1_feedback} />}</FormField>
              <FormField name="step2_explore" label="ขั้นที่ 2: สำรวจและค้นหา (Explore)" className="md:col-span-2"><Textarea name="step2_explore" value={formData.step2_explore} onChange={handleChange} />{aiFeedback?.step2_feedback && <AiFeedback content={aiFeedback.step2_feedback} />}</FormField>
              <FormField name="step3_explain" label="ขั้นที่ 3: อธิบายความรู้ (Explain)" className="md:col-span-2"><Textarea name="step3_explain" value={formData.step3_explain} onChange={handleChange} />{aiFeedback?.step3_feedback && <AiFeedback content={aiFeedback.step3_feedback} />}</FormField>
              <FormField name="step4_elaborate" label="ขั้นที่ 4: ขยายความเข้าใจ (Elaborate)" className="md:col-span-2"><Textarea name="step4_elaborate" value={formData.step4_elaborate} onChange={handleChange} />{aiFeedback?.step4_elaborate && <AiFeedback content={aiFeedback.step4_elaborate} />}</FormField>
              <FormField name="step5_evaluate" label="ขั้นที่ 5: ประเมินผล (Evaluate)" className="md:col-span-2"><Textarea name="step5_evaluate" value={formData.step5_evaluate} onChange={handleChange} />{aiFeedback?.step5_feedback && <AiFeedback content={aiFeedback.step5_feedback} />}</FormField>
              {aiFeedback?.error && <p className="text-red-600 md:col-span-2 text-center">{aiFeedback.error}</p>}
              <FormField name="grouping" label="การจัดกลุ่มเรียน"><Input type="text" name="grouping" value={formData.grouping} onChange={handleChange} /></FormField>
              <FormField name="media" label="สื่อและแหล่งเรียนรู้ (อื่นๆ)"><Input type="text" name="media" value={formData.media} onChange={handleChange} placeholder="เช่น อุปกรณ์ในห้องทดลอง" /></FormField>
              <FormField name="homework" label="กิจกรรมเสริม/การบ้าน" className="md:col-span-2"><Input type="text" name="homework" value={formData.homework} onChange={handleChange} /></FormField>
          </FormSection>
          
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">ไฟล์แนบและสื่อการสอน</h3>
             <div className="space-y-4">
               {attachments.length > 0 && (<ul className="space-y-2">{attachments.map(att => (<li key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"><div className="flex items-center gap-3 overflow-hidden"><AttachmentIcon type={att.type} /><div><p className="text-sm font-medium text-gray-800">{att.name}</p><p className="text-xs text-gray-500 truncate">{att.fileName || att.url}</p></div></div><button onClick={() => handleRemoveAttachment(att.id)} className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"><TrashIcon className="h-5 w-5" /></button></li>))}</ul>)}
               <div className="p-4 border border-dashed rounded-lg space-y-3">
                 <h4 className="font-semibold text-gray-700">เพิ่มไฟล์แนบใหม่</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                   <div className="md:col-span-3"><label className="text-sm font-medium text-gray-700 block mb-1">ชื่อสื่อ</label><Input type="text" name="name" value={newAttachment.name} onChange={handleNewAttachmentChange} placeholder="เช่น ใบงานที่ 1.1" /></div>
                   <div><label className="text-sm font-medium text-gray-700 block mb-1">ประเภท</label><select name="type" value={newAttachment.type} onChange={handleNewAttachmentChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value={AttachmentType.Document}>เอกสารประกอบ</option><option value={AttachmentType.Image}>รูปภาพ</option><option value={AttachmentType.Link}>ลิงค์</option></select></div>
                   <div className="md:col-span-2">{newAttachment.type === AttachmentType.Link ? (<div><label className="text-sm font-medium text-gray-700 block mb-1">URL</label><Input type="text" name="url" value={newAttachment.url} onChange={handleNewAttachmentChange} placeholder="https://www.youtube.com/watch?v=..." /></div>) : (<div><label className="text-sm font-medium text-gray-700 block mb-1">เลือกไฟล์</label><input type="file" onChange={handleFileChange} accept={newAttachment.type === AttachmentType.Image ? 'image/*' : '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip'} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div>)}</div>
                 </div>
                 <div className="text-right mt-2"><button onClick={handleAddAttachment} type="button" className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-200"><PlusIcon className="h-4 w-4" /> เพิ่มไฟล์แนบ</button></div>
               </div>
             </div>
           </div>

          <FormSection title="การวัดและประเมินผล">
            <FormField name="assessmentMethods" label="วิธีการประเมิน" className="md:col-span-2"><Textarea name="assessmentMethods" value={formData.assessmentMethods} onChange={handleChange} /></FormField>
            <FormField name="assessmentTools" label="เครื่องมือประเมิน" className="md:col-span-2"><Textarea name="assessmentTools" value={formData.assessmentTools} onChange={handleChange} /></FormField>
            <FormField name="assessmentCriteria" label="เกณฑ์การประเมิน" className="md:col-span-2"><Textarea name="assessmentCriteria" value={formData.assessmentCriteria} onChange={handleChange} /></FormField>
          </FormSection>
          <FormSection title="หมายเหตุเพิ่มเติม"><FormField name="teacherNotes" label="ข้อเสนอแนะหรือบันทึกของครู" className="md:col-span-2"><Textarea name="teacherNotes" value={formData.teacherNotes} onChange={handleChange} /></FormField></FormSection>
        </div>
        <div className="flex justify-end items-center p-4 border-t bg-white rounded-b-lg space-x-3 sticky bottom-0 z-10">
          <button onClick={onClose} disabled={isSubmitting} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">ยกเลิก</button>
          <button onClick={() => handleSubmit(PlanStatus.Draft)} disabled={isSubmitting} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">บันทึกฉบับร่าง</button>
          <button onClick={() => handleSubmit(PlanStatus.Pending_DeptHead)} disabled={isSubmitting || isAnalyzing} className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'กำลังบันทึก...' : (plan?.status === PlanStatus.Revision ? 'ส่งตรวจอีกครั้ง' : 'ส่งตรวจ')}</button>
        </div>
      </div>
    </div>
    );
};

export default FullLessonPlanFormModal;

