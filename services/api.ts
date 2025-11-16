import { LessonPlan, PlanStatus, AttachmentType } from '../types';
import { MOCK_TEACHER_ID, MOCK_TEACHER_NAME } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

// --- Mock Database ---
let lessonPlans: LessonPlan[] = [
  {
    id: 'lp-001',
    teacherId: MOCK_TEACHER_ID,
    teacherName: MOCK_TEACHER_NAME,
    planName: 'ความมหัศจรรย์ของเซลล์พืชและเซลล์สัตว์',
    subject: 'วิทยาศาสตร์',
    grade: 'ม.1',
    term: '1',
    academicYear: '2567',
    unit: 'หน่วยที่ 1: สิ่งมีชีวิต',
    duration: '2 คาบ',
    teachingDate: '2024-08-05',
    standards: 'ว 1.2 ม.1/1',
    objectives: '1. อธิบายโครงสร้างและหน้าที่ของเซลล์พืชและเซลล์สัตว์ได้\n2. เปรียบเทียบความแตกต่างของเซลล์พืชและเซลล์สัตว์ได้',
    coreConcepts: 'เซลล์เป็นหน่วยพื้นฐานของสิ่งมีชีวิต',
    step1_engage: 'นำภาพเซลล์พืชและเซลล์สัตว์ให้นักเรียนดูและตั้งคำถามเพื่อกระตุ้นความสนใจ',
    step2_explore: 'แบ่งกลุ่มนักเรียนใช้กล้องจุลทรรศน์ส่องดูเซลล์พืช (เช่น เซลล์สาหร่ายหางกระรอก) และเซลล์สัตว์ (เช่น เซลล์เยื่อบุข้างแก้ม) และบันทึกผล',
    step3_explain: 'แต่ละกลุ่มนำเสนอสิ่งที่สังเกตได้ จากนั้นครูอธิบายสรุปโครงสร้างและหน้าที่ของส่วนประกอบแต่ละอย่าง',
    step4_elaborate: 'ให้นักเรียนนำความรู้ไปเปรียบเทียบกับเซลล์ชนิดอื่นๆ เช่น เซลล์เม็ดเลือดแดง หรือเซลล์ประสาท ว่ามีโครงสร้างใดเหมือนหรือต่างกันเพราะเหตุใด',
    step5_evaluate: 'นักเรียนทำใบงานสรุปความแตกต่างของเซลล์พืชและเซลล์สัตว์ และตอบคำถามท้ายกิจกรรม',
    grouping: 'กลุ่มย่อย',
    media: 'กล้องจุลทรรศน์, สไลด์เซลล์, Powerpoint',
    homework: 'วาดภาพเซลล์พร้อมระบุส่วนประกอบ',
    assessmentMethods: 'สังเกตพฤติกรรมกลุ่ม, ตรวจใบงาน',
    assessmentTools: 'แบบสังเกต, แบบตรวจใบงาน',
    assessmentCriteria: 'ผ่านเกณฑ์ร้อยละ 70',
    teacherNotes: 'เตรียมกล้องจุลทรรศน์ให้พร้อมใช้งาน',
    status: PlanStatus.Approved,
    reviewerFeedback: 'แผนการสอนดีมาก มีกิจกรรมที่หลากหลาย น่าสนใจ',
    attachments: [
      { id: 'att-1', type: AttachmentType.Document, name: 'ใบงานที่ 1.1: ส่วนประกอบของเซลล์', url: '#', fileName: 'worksheet_cell.pdf' },
      { id: 'att-2', type: AttachmentType.Image, name: 'ภาพตัวอย่างเซลล์จากกล้องจุลทรรศน์', url: '#', fileName: 'cell_sample.jpg' },
      { id: 'att-3', type: AttachmentType.Link, name: 'วิดีโอเรื่องเซลล์จาก YouTube', url: 'https://www.youtube.com' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lp-002',
    teacherId: MOCK_TEACHER_ID,
    teacherName: MOCK_TEACHER_NAME,
    planName: 'การบวกเลขไม่เกิน 100',
    subject: 'คณิตศาสตร์',
    grade: 'ป.1',
    term: '1',
    academicYear: '2567',
    unit: 'หน่วยที่ 2: การบวกและการลบ',
    duration: '1 คาบ',
    teachingDate: '2024-08-10',
    standards: 'ค 1.1 ป.1/4',
    objectives: 'นักเรียนสามารถบวกเลขสองหลักที่ผลบวกไม่เกิน 100 ได้',
    coreConcepts: 'การบวกคือการนำจำนวนมารวมกัน',
    step1_engage: 'ร้องเพลงเกี่ยวกับการนับเลข และทบทวนการนับ 1-100',
    step2_explore: 'ให้นักเรียนใช้หลอดหรือฝาขวดน้ำในการนับจำนวนและลองรวมกลุ่มกันเพื่อหาผลบวกอย่างง่าย',
    step3_explain: 'ครูสาธิตวิธีการบวกเลขโดยใช้ของจริง และแนะนำวิธีการบวกในแนวตั้ง',
    step4_elaborate: 'นักเรียนจับคู่เล่นเกมบัตรคำโจทย์ปัญหาการบวกเลข',
    step5_evaluate: 'นักเรียนทำแบบฝึกหัดท้ายบทเรียน 10 ข้อ',
    grouping: 'เดี่ยว/คู่',
    media: 'บัตรภาพตัวเลข, แบบฝึกหัด, หลอด',
    homework: '-',
    assessmentMethods: 'ตรวจแบบฝึกหัด',
    assessmentTools: 'แบบฝึกหัด',
    assessmentCriteria: 'ทำถูก 8 ข้อจาก 10 ข้อ',
    teacherNotes: '',
    status: PlanStatus.Revision,
    reviewerFeedback: 'กรุณาเพิ่มกิจกรรมขั้นสอนที่ส่งเสริมการทำงานเป็นกลุ่ม เพื่อให้นักเรียนได้แลกเปลี่ยนเรียนรู้กันมากขึ้นครับ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
   {
    id: 'lp-003',
    teacherId: 'teacher_02',
    teacherName: 'ครูสมหญิง เก่งมาก',
    planName: 'ประวัติศาสตร์สมัยสุโขทัย',
    subject: 'สังคมศึกษา',
    grade: 'ม.2',
    term: '1',
    academicYear: '2567',
    unit: 'หน่วยที่ 3: ประวัติศาสตร์ไทย',
    duration: '3 คาบ',
    teachingDate: '2024-08-12',
    standards: 'ส 4.3 ม.2/1',
    objectives: 'นักเรียนสามารถอธิบายพัฒนาการของอาณาจักรสุโขทัยได้',
    coreConcepts: 'อาณาจักรสุโขทัยเป็นราชธานีแห่งแรกของไทย',
    step1_engage: 'ให้นักเรียนดูวิดีทัศน์เกี่ยวกับอุทยานประวัติศาสตร์สุโขทัยและถามคำถามนำ',
    step2_explore: 'แบ่งกลุ่มศึกษาค้นคว้าพัฒนาการด้านต่างๆ ของสุโขทัยจากหนังสือเรียนและแหล่งข้อมูลออนไลน์',
    step3_explain: 'แต่ละกลุ่มนำเสนอผลการศึกษาหน้าชั้นเรียน ครูคอยเสริมและอธิบายเพิ่มเติมในส่วนที่สำคัญ',
    step4_elaborate: 'อภิปรายร่วมกันในหัวข้อ "ปัจจัยใดที่ส่งผลต่อความเจริญรุ่งเรืองของอาณาจักรสุโขทัย"',
    step5_evaluate: 'นักเรียนเขียนสรุปความรู้เป็นแผนผังความคิด (Mind Mapping)',
    grouping: 'กลุ่ม/ทั้งชั้น',
    media: 'วิดีทัศน์, Powerpoint',
    homework: 'สรุปความรู้เป็นแผนผังความคิด',
    assessmentMethods: 'ประเมินแผนผังความคิด',
    assessmentTools: 'แบบประเมินชิ้นงาน',
    assessmentCriteria: 'ได้ระดับคุณภาพดีขึ้นไป',
    teacherNotes: '',
    status: PlanStatus.Pending_DeptHead,
    reviewerFeedback: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
   {
    id: 'lp-004',
    teacherId: MOCK_TEACHER_ID,
    teacherName: MOCK_TEACHER_NAME,
    planName: 'วงจรไฟฟ้าเบื้องต้น',
    subject: 'วิทยาศาสตร์',
    grade: 'ป.6',
    term: '1',
    academicYear: '2567',
    unit: 'หน่วยที่ 4: ไฟฟ้า',
    duration: '2 คาบ',
    teachingDate: '2024-08-15',
    standards: 'ว 2.3 ป.6/1',
    objectives: 'นักเรียนสามารถต่อวงจรไฟฟ้าอย่างง่ายได้',
    coreConcepts: 'วงจรไฟฟ้าประกอบด้วยแหล่งกำเนิดไฟฟ้า, ตัวนำไฟฟ้า, และอุปกรณ์ไฟฟ้า',
    step1_engage: 'ถามนักเรียนว่าเครื่องใช้ไฟฟ้าในบ้านทำงานได้อย่างไร',
    step2_explore: 'ให้นักเรียนแต่ละกลุ่มทดลองต่อวงจรไฟฟ้าอย่างง่ายด้วยชุดอุปกรณ์',
    step3_explain: 'ครูและนักเรียนร่วมกันสรุปส่วนประกอบและหลักการทำงานของวงจรไฟฟ้า',
    step4_elaborate: 'ให้นักเรียนออกแบบการต่อวงจรไฟฟ้าเพื่อแก้ปัญหาในสถานการณ์จำลอง (เช่น ไฟส่องสว่างในบ้านตุ๊กตา)',
    step5_evaluate: 'ตรวจผลงานการต่อวงจรไฟฟ้า และสังเกตการทำงานกลุ่ม',
    grouping: 'กลุ่ม',
    media: 'ชุดอุปกรณ์วงจรไฟฟ้า',
    homework: '',
    assessmentMethods: 'ตรวจชิ้นงาน, สังเกตพฤติกรรม',
    assessmentTools: 'แบบประเมินชิ้นงาน',
    assessmentCriteria: 'ต่อวงจรถูกต้องและหลอดไฟสว่าง',
    teacherNotes: 'ตรวจสอบถ่านไฟฉายก่อนทำกิจกรรม',
    status: PlanStatus.Pending_Academic,
    reviewerFeedback: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lp-005',
    teacherId: 'teacher_02',
    teacherName: 'ครูสมหญิง เก่งมาก',
    planName: 'ศิลปะสมัยฟื้นฟูศิลปวิทยา',
    subject: 'ศิลปะ',
    grade: 'ม.3',
    term: '1',
    academicYear: '2567',
    unit: 'หน่วยที่ 2: ประวัติศาสตร์ศิลป์ตะวันตก',
    duration: '2 คาบ',
    teachingDate: '2024-08-20',
    standards: 'ศ 1.2 ม.3/2',
    objectives: 'นักเรียนสามารถวิเคราะห์และเปรียบเทียบผลงานศิลปะในยุคฟื้นฟูศิลปวิทยาได้',
    coreConcepts: 'ศิลปะยุคฟื้นฟูศิลปวิทยาเน้นความสมจริงและสัดส่วนของมนุษย์',
    step1_engage: 'เปิดภาพผลงาน Mona Lisa และ The Last Supper ให้นักเรียนดู และถามว่ารู้จักศิลปินหรือไม่',
    step2_explore: 'นักเรียนแบ่งกลุ่มสืบค้นข้อมูลเกี่ยวกับศิลปินและผลงานชิ้นเอกในยุคเรอเนซองส์',
    step3_explain: 'แต่ละกลุ่มนำเสนอข้อมูลที่ได้ ครูสรุปภาพรวมและลักษณะเด่นของศิลปะในยุคนี้',
    step4_elaborate: 'ให้นักเรียนวิจารณ์ผลงานศิลปะที่ตนเองชื่นชอบ โดยอ้างอิงจากหลักการของศิลปะยุคเรอเนซองส์',
    step5_evaluate: 'ทำแบบทดสอบท้ายบทเรียน',
    grouping: 'กลุ่ม',
    media: 'Powerpoint, รูปภาพผลงานศิลปะ',
    homework: '',
    assessmentMethods: 'แบบทดสอบ',
    assessmentTools: 'แบบทดสอบออนไลน์',
    assessmentCriteria: 'ผ่านเกณฑ์ 70%',
    teacherNotes: '',
    status: PlanStatus.Pending_Director,
    reviewerFeedback: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const simulateDelay = <T,>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), 500));

// --- API Functions ---

export const api = {
  getLessonPlans: async (teacherId?: string): Promise<LessonPlan[]> => {
    let result = lessonPlans;
    if (teacherId) {
      result = lessonPlans.filter(p => p.teacherId === teacherId);
    }
    return simulateDelay([...result].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  },

  getLessonPlanById: async (id: string): Promise<LessonPlan | undefined> => {
    const plan = lessonPlans.find(p => p.id === id);
    return simulateDelay(plan);
  },

  createLessonPlan: async (planData: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<LessonPlan> => {
    const newPlan: LessonPlan = {
      ...planData,
      id: `lp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    lessonPlans.push(newPlan);
    return simulateDelay(newPlan);
  },

  updateLessonPlan: async (id: string, updates: Partial<LessonPlan>): Promise<LessonPlan | null> => {
    const index = lessonPlans.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    lessonPlans[index] = {
      ...lessonPlans[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return simulateDelay(lessonPlans[index]);
  },

  updateLessonPlanStatus: async (id: string, status: PlanStatus, feedback?: string): Promise<LessonPlan | null> => {
    const index = lessonPlans.findIndex(p => p.id === id);
    if (index === -1) return null;

    lessonPlans[index].status = status;
    lessonPlans[index].updatedAt = new Date().toISOString();
    if (feedback !== undefined) {
      lessonPlans[index].reviewerFeedback = feedback;
    }
    return simulateDelay(lessonPlans[index]);
  },

  analyzeLessonPlanSteps: async (
    planName: string,
    subject: string,
    steps: {
      step1_engage: string;
      step2_explore: string;
      step3_explain: string;
      step4_elaborate: string;
      step5_evaluate: string;
    }
  ): Promise<any> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `คุณคือผู้เชี่ยวชาญด้านการออกแบบหลักสูตรและการสอนของไทย โปรดวิเคราะห์ขั้นตอนการสอน 5 ขั้นตอนต่อไปนี้ (Active Learning) สำหรับแผนการสอนเรื่อง "${planName}" วิชา "${subject}" และให้ข้อเสนอแนะเพื่อการปรับปรุงเป็นภาษาไทยในแต่ละขั้นตอน
      
      ขั้นที่ 1 สร้างความสนใจ (Engage): ${steps.step1_engage || '(ไม่มีข้อมูล)'}
      ขั้นที่ 2 สำรวจและค้นหา (Explore): ${steps.step2_explore || '(ไม่มีข้อมูล)'}
      ขั้นที่ 3 อธิบายความรู้ (Explain): ${steps.step3_explain || '(ไม่มีข้อมูล)'}
      ขั้นที่ 4 ขยายความเข้าใจ (Elaborate): ${steps.step4_elaborate || '(ไม่มีข้อมูล)'}
      ขั้นที่ 5 ประเมินผล (Evaluate): ${steps.step5_evaluate || '(ไม่มีข้อมูล)'}

      โปรดประเมินความสอดคล้องของแต่ละขั้นตอนและให้คำแนะนำที่นำไปใช้ได้จริงในรูปแบบ JSON`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall_summary: { type: Type.STRING, description: 'สรุปภาพรวมและข้อเสนอแนะหลักเป็นภาษาไทย' },
              step1_feedback: { type: Type.STRING, description: 'ข้อเสนอแนะสำหรับขั้นที่ 1 เป็นภาษาไทย' },
              step2_feedback: { type: Type.STRING, description: 'ข้อเสนอแนะสำหรับขั้นที่ 2 เป็นภาษาไทย' },
              step3_feedback: { type: Type.STRING, description: 'ข้อเสนอแนะสำหรับขั้นที่ 3 เป็นภาษาไทย' },
              step4_feedback: { type: Type.STRING, description: 'ข้อเสนอแนะสำหรับขั้นที่ 4 เป็นภาษาไทย' },
              step5_feedback: { type: Type.STRING, description: 'ข้อเสนอแนะสำหรับขั้นที่ 5 เป็นภาษาไทย' },
            },
            required: ["overall_summary", "step1_feedback", "step2_feedback", "step3_feedback", "step4_feedback", "step5_feedback"]
          },
        },
      });
      
      return JSON.parse(response.text);

    } catch (error) {
      console.error("Gemini API call failed:", error);
      return { error: 'การวิเคราะห์ด้วย AI ล้มเหลว กรุณาลองใหม่อีกครั้ง' };
    }
  },
};