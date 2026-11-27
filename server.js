const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure directories exist
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const CHATS_FILE = path.join(DATA_DIR, 'chats.json');
const LIBRARY_FILE = path.join(DATA_DIR, 'library.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

// Seed data
function initSeedData() {
  if (!fs.existsSync(CHATS_FILE)) {
    const now = Date.now();
    const day = 86400000;
    const initialChats = [
      {
        id: 'chat-today-1',
        title: 'ไอเดียคอนเทนต์สำหรับเดือนหน้า',
        category: 'today',
        createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 30).toISOString(),
        messages: [
          { role: 'user', content: 'ขอไอเดียคอนเทนต์ทำคลิปสั้นลง TikTok และ Reels สำหรับเดือนหน้าหน่อย โทนสนุกสนาน ได้ความรู้', createdAt: new Date(now - 1000 * 60 * 30).toISOString() },
          { role: 'assistant', content: 'สวัสดีครับ! ยินดีช่วยวางแผนคอนเทนต์สำหรับเดือนหน้าครับ นี่คือ **5 ไอเดียคลิปสั้น** ที่นำไปปรับใช้ได้ทันที:\n\n1. **"สิ่งที่คนส่วนใหญ่เข้าใจผิดเกี่ยวกับ..."** 🧠\n   - จับประเด็นความเข้าใจผิดยอดฮิตในสายงานคุณ มาเฉลยใน 30 วินาที\n2. **"1 เคล็ดลับที่เปลี่ยนชีวิตการทำงาน"** ⚡\n   - สาธิตวิธีลัด เครื่องมือ หรือเทคนิคแก้ปัญหาที่เห็นผลชัดเจน\n3. **"เบื้องหลังที่ไม่เคยบอกใคร (Behind the Scenes)"** 🎬\n   - ให้ผู้ชมเห็นขั้นตอนการทำงานจริง ความเป็นธรรมชาติจะสร้างความผูกพันสูง\n4. **"ถาม-ตอบ คำถามยอดฮิตจากลูกเพจ"** 💬\n   - แคปคำถามจริงมาขึ้นหน้าจอ แล้วตอบแบบกระชับ มีภาพประกอบ\n5. **"รีวิวสรุป 3 เครื่องมือฟรีประจำเดือน"** 🛠️\n   - เครื่องมือ AI หรือแอปพลิเคชันที่ช่วยประหยัดเวลา\n\nสนใจอยากให้ช่วยลงตาราง Content Calendar ประจำสัปดาห์ต่อไหมครับ?', createdAt: new Date(now - 1000 * 60 * 29).toISOString() }
        ]
      },
      {
        id: 'chat-today-2',
        title: 'ช่วยวางแผนเที่ยวเชียงใหม่',
        category: 'today',
        createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 90).toISOString(),
        messages: [
          { role: 'user', content: 'อยากไปเที่ยวเชียงใหม่ 3 วัน 2 คืน เน้นคาเฟ่ ธรรมชาติ และกินของอร่อย ขอแพลนกระชับๆ', createdAt: new Date(now - 1000 * 60 * 90).toISOString() },
          { role: 'assistant', content: 'จัดให้ครับ! ทริปเชียงใหม่ 3 วัน 2 คืน พักผ่อนสบายๆ:\n\n### 🌿 วันที่ 1: เสน่ห์เมืองเก่า & นิมมาน\n- **เช้า:** บินลงเชียงใหม่ แวะชิมข้าวซอยแม่สาย\n- **บ่าย:** เดินเล่นย่านนิมมาน ชิมกาแฟร้านดัง (Roast8ry / Graph)\n- **เย็น:** ถนนคนเดิน หรือทานอาหารเหนือที่ร้านต๋องเต็มโต๊ะ\n\n### 🏔️ วันที่ 2: สูดอากาศแม่ริม & ม่อนแจ่ม\n- **เช้า:** มุ่งหน้าแม่ริม แวะสวนส้มหรือสวนดอกไม้\n- **บ่าย:** พักผ่อนที่ม่อนแจ่ม ชมวิวภูเขา\n- **ค่ำ:** แวะนั่งชิลล์โกดังเก่าโกเหน่ง ย่านช้างม่อย\n\n### ☕ วันที่ 3: คาเฟ่ธรรมชาติก่อนกลับ\n- **เช้า:** เดินตลาดเช้าจริงใจมาร์เก็ต (JJ Market) หาของกินพื้นเมือง\n- **บ่าย:** แวะวัดอุโมงค์ และคาเฟ่ธรรมชาติแถวร่ำเปิง\n- **เย็น:** ซื้อของฝากตลาดวโรรส แล้วเดินทางไปสนามบิน', createdAt: new Date(now - 1000 * 60 * 89).toISOString() }
        ]
      },
      {
        id: 'chat-today-3',
        title: 'สรุปบทความให้อ่านง่าย',
        category: 'today',
        createdAt: new Date(now - 1000 * 60 * 180).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 180).toISOString(),
        messages: [
          { role: 'user', content: 'ช่วยสรุปหลักการ 80/20 (Pareto Principle) ใน 3 บรรทัด', createdAt: new Date(now - 1000 * 60 * 180).toISOString() },
          { role: 'assistant', content: '**กฎ 80/20 (Pareto Principle):**\n\n1. ผลลัพธ์ส่วนใหญ่ 80% เกิดจากปัจจัยตั้งต้นที่สำคัญเพียง 20%\n2. หากโฟกัสถูกจุดกับสิ่งที่มีผลกระทบสูงสุด จะประหยัดแรงและเวลาได้อย่างมหาศาล\n3. หัวใจสำคัญคือการ "ตัดสิ่งที่ไม่จำเป็น" แล้วทุ่มพลังให้ 20% ที่สร้างความเปลี่ยนแปลงจริง', createdAt: new Date(now - 1000 * 60 * 179).toISOString() }
        ]
      },
      {
        id: 'chat-week-1',
        title: 'ตั้งชื่อแบรนด์คาเฟ่ใหม่',
        category: 'week',
        createdAt: new Date(now - day * 2).toISOString(),
        updatedAt: new Date(now - day * 2).toISOString(),
        messages: [
          { role: 'user', content: 'กำลังจะเปิดคาเฟ่สไตล์มินิมอล ญี่ปุ่น อบอุ่น มีขนมปังสด ช่วยตั้งชื่อแบรนด์ให้หน่อย', createdAt: new Date(now - day * 2).toISOString() },
          { role: 'assistant', content: 'นี่คือไอเดียชื่อแบรนด์คาเฟ่มินิมอลสไตล์ญี่ปุ่น อบอุ่นและจดจำง่าย:\n\n1. **Komorebi Cafe (โคโมเรบิ)** - แสงแดดที่ส่องลอดผ่านใบไม้ สื่อถึงความสงบและร่มรื่น\n2. **Pan & Pokka (ปัง แอนด์ ป๊กกะ)** - อบอุ่น สดชื่น เหมาะกับร้านเน้นขนมอบสดใหม่\n3. **Hiyori Bakehouse (ฮิโยริ)** - วันที่อากาศดี เหมาะกับการพักดื่มกาแฟ\n4. **Mame & Mug (มาเมะ แอนด์ มัก)** - เมล็ดกาแฟและแก้วโปรด สื่อสารตรงไปตรงมา\n5. **Sunao (สึนาโอะ)** - ความเรียบง่าย จริงใจ บริสุทธิ์ในรสชาติ', createdAt: new Date(now - day * 2).toISOString() }
        ]
      },
      {
        id: 'chat-week-2',
        title: 'เขียนอีเมลติดต่อลูกค้า',
        category: 'week',
        createdAt: new Date(now - day * 3).toISOString(),
        updatedAt: new Date(now - day * 3).toISOString(),
        messages: [
          { role: 'user', content: 'ช่วยร่างอีเมลขอส่งใบเสนอราคาและนัดคุยโปรเจกต์กับลูกค้าอย่างเป็นทางการ', createdAt: new Date(now - day * 3).toISOString() },
          { role: 'assistant', content: 'นี่คือร่างอีเมลที่เป็นมืออาชีพและสุภาพครับ:\n\n**เรื่อง:** นำส่งใบเสนอราคาและขอเรียนเชิญประชุมหารือโปรเจกต์ [ชื่อโปรเจกต์] - [ชื่อบริษัทคุณ]\n\nเรียน คุณ [ชื่อลูกค้า] และทีมงาน,\n\nทางทีมงาน [ชื่อบริษัทคุณ] ขอขอบพระคุณอย่างยิ่งสำหรับโอกาสในการนำเสนอข้อเสนอความร่วมมือในครั้งนี้\n\nตามที่ได้หารือเบื้องต้น ทางเราได้จัดทำเอกสารใบเสนอราคาและขอบเขตงาน (Scope of Work) รายละเอียดตามเอกสารแนบ เพื่อประกอบการพิจารณาครับ\n\nทั้งนี้ เพื่อให้เกิดความชัดเจนและสามารถตอบข้อซักถามของท่านได้อย่างครบถ้วน ทางทีมงานใคร่ขอเรียนเชิญประชุมผ่านช่องทางออนไลน์ (Google Meet / Zoom) เป็นเวลาประมาณ 30 นาที ในช่วงวันเวลาที่ท่านสะดวก:\n- ตัวเลือกที่ 1: [ระบุวันและเวลา]\n- ตัวเลือกที่ 2: [ระบุวันและเวลา]\n\nขอแสดงความนับถือ,\n[ชื่อคุณ]\n[ตำแหน่งและเบอร์ติดต่อ]', createdAt: new Date(now - day * 3).toISOString() }
        ]
      },
      {
        id: 'chat-week-3',
        title: 'เริ่มเรียน Python จากศูนย์',
        category: 'week',
        createdAt: new Date(now - day * 4).toISOString(),
        updatedAt: new Date(now - day * 4).toISOString(),
        messages: [
          { role: 'user', content: 'ไม่เคยเขียนโค้ดมาก่อนเลย อยากเริ่มเรียน Python ควรอ่านอะไรเป็นลำดับแรก', createdAt: new Date(now - day * 4).toISOString() },
          { role: 'assistant', content: 'ยินดีต้อนรับสู่โลกแห่งการเขียนโปรแกรมครับ! Python เป็นภาษาที่เหมาะที่สุดสำหรับผู้เริ่มต้น แนะนำ Roadmap 4 ขั้นตอนง่ายๆ ดังนี้ครับ:\n\n```python\n# โค้ดแรกในชีวิตคุณ:\nprint("Hello, World!")\n```\n\n### ลำดับการเรียนรู้:\n1. **พื้นฐานหลัก (สัปดาห์ 1-2):** Variables, Data Types (int, float, str, boolean), `if-else`, และการรับค่า input\n2. **โครงสร้างข้อมูลและการวนซ้ำ (สัปดาห์ 3):** Lists, Dictionaries, Loops (`for`, `while`)\n3. **ฟังก์ชัน (สัปดาห์ 4):** การเขียน `def function()` เพื่อจัดระเบียบโค้ด\n4. **สร้างโปรเจกต์จิ๋ว:** เช่น โปรแกรมคำนวณภาษี, บอทสุ่มเมนูอาหาร หรือเกมทายตัวเลข', createdAt: new Date(now - day * 4).toISOString() }
        ]
      },
      {
        id: 'chat-week-4',
        title: 'วางแผนการทำงานรายสัปดาห์',
        category: 'week',
        createdAt: new Date(now - day * 5).toISOString(),
        updatedAt: new Date(now - day * 5).toISOString(),
        messages: [
          { role: 'user', content: 'มีงานเยอะมากจนสับสน ช่วยแนะนำวิธีวางแผนงานประจำสัปดาห์ให้มีประสิทธิภาพหน่อย', createdAt: new Date(now - day * 5).toISOString() },
          { role: 'assistant', content: 'แนะนำเทคนิค **"Weekly Time-Boxing & Eisenhower Matrix"** 3 ขั้นตอนครับ:\n\n1. **Brain Dump (วันศุกร์เย็นหรืออาทิตย์ค่ำ):** จดงานทุกอย่างที่ค้างคาลงกระดาษโดยไม่ต้องเรียงลำดับ\n2. **คัดกรอง 3 งานสำคัญที่สุด (Top 3 Big Rocks):** เลือกเพียง 3 สิ่งที่หากทำเสร็จในสัปดาห์นี้จะถือว่าประสบความสำเร็จ\n3. **จัดช่วงเวลาโฟกัส (Deep Work Blocks):** ล็อกเวลาช่วงเช้า 9:00 - 11:30 น. เป็นเวลาห้ามรบกวนสำหรับงานยาก และจัดงานตอบอีเมล/ประชุมไว้ช่วงบ่าย', createdAt: new Date(now - day * 5).toISOString() }
        ]
      }
    ];
    fs.writeFileSync(CHATS_FILE, JSON.stringify(initialChats, null, 2), 'utf-8');
  }

  if (!fs.existsSync(LIBRARY_FILE)) {
    const initialLibrary = [
      { id: 'lib-1', title: 'เขียนแคปชันขายของ', prompt: 'ช่วยคิดแคปชันขายสินค้าให้น่าสนใจ มี Call to Action ชัดเจน สำหรับสินค้า: [ระบุสินค้า]' },
      { id: 'lib-2', title: 'ตรวจไวยากรณ์ภาษาอังกฤษ', prompt: 'ช่วยตรวจความถูกต้องของไวยากรณ์และปรับรูปประโยคภาษาอังกฤษต่อไปนี้ให้เป็นธรรมชาติและสละสลวย: [ใส่ข้อความ]' },
      { id: 'lib-3', title: 'ช่วยแก้ Bug ในโค้ด', prompt: 'วิเคราะห์โค้ดต่อไปนี้ หาจุดผิดพลาด (Bug) และเสนอแนวทางแก้ไขพร้อมอธิบายสาเหตุ: [แนบโค้ด]' }
    ];
    fs.writeFileSync(LIBRARY_FILE, JSON.stringify(initialLibrary, null, 2), 'utf-8');
  }

  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch {}

  const defaultSettings = {
    defaultModel: 'Maneega 1.5',
    temperature: 0.7,
    backendUrl: 'http://127.0.0.1:5000/api/chat',
    systemPrompt: 'คุณคือ Maneega (มณีภา) ผู้ช่วย AI อัจฉริยะที่อบอุ่น ฉลาด เป็นกันเอง ตอบคำถามอย่างสุภาพ ถูกต้อง และจัดรูปแบบให้อ่านง่ายเสมอ',
    apiKey: process.env.GEMINI_API_KEY || ''
  };

  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ ...defaultSettings, ...settings }, null, 2), 'utf-8');
}
initSeedData();

// Helper helpers
function readChats() {
  try {
    return JSON.parse(fs.readFileSync(CHATS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}
function writeChats(chats) {
  fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2), 'utf-8');
}

function getSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch {
    return { backendUrl: 'http://127.0.0.1:5000/api/chat' };
  }
}

// Built-in intelligent AI response generator
function generateAIResponse(userPrompt, history = [], model = 'Maneega 1.5') {
  const prompt = userPrompt.toLowerCase().trim();

  // Code generation & programming
  if (prompt.includes('โค้ด') || prompt.includes('code') || prompt.includes('python') || prompt.includes('javascript') || prompt.includes('html') || prompt.includes('react') || prompt.includes('sql') || prompt.includes('เขียนโปรแกรม')) {
    return `ยินดีด้วยครับ! นี่คือตัวอย่างโค้ดและคำอธิบายที่คุณต้องการ:\n\n\`\`\`javascript\n// ตัวอย่างฟังก์ชันสำหรับจัดการข้อมูล\nfunction processData(items) {\n  if (!Array.isArray(items)) return [];\n  \n  return items\n    .filter(item => item.active)\n    .map(item => ({\n      id: item.id,\n      name: item.name,\n      updatedAt: new Date().toISOString()\n    }));\n}\n\n// ตัวอย่างการใช้งาน\nconst sample = [\n  { id: 1, name: "Node.js Service", active: true },\n  { id: 2, name: "Deprecated Module", active: false }\n];\nconsole.log(processData(sample));\n\`\`\`\n\n### 💡 สรุปการทำงานทีละขั้นตอน:\n1. ตรวจสอบเงื่อนไขความถูกต้องของ Input ก่อนประมวลผล\n2. ใช้ **Functional Programming** (\`.filter()\` และ \`.map()\`) เพื่อให้อ่านง่ายและทำงานรวดเร็ว\n3. รองรับการขยายผลและนำไปต่อยอดกับระบบอื่นได้ทันทีครับ\n\nต้องการให้ผมช่วยเขียน Test Cases หรืออธิบายส่วนไหนเพิ่มเติมไหมครับ?`;
  }

  // Writing & Copywriting
  if (prompt.includes('เขียน') || prompt.includes('อีเมล') || prompt.includes('จดหมาย') || prompt.includes('บทความ') || prompt.includes('โพสต์') || prompt.includes('แคปชัน')) {
    return `ได้เลยครับ! นี่คือแบบร่างงานเขียนที่ปรับแต่งให้เป็นมืออาชีพและน่าอ่าน:\n\n---\n\n### 📝 ร่างเนื้อหาแนะนำ:\n\n**หัวข้อ:** ก้าวสู่ความสำเร็จด้วยกลยุทธ์ที่ตรงจุด\n\nสวัสดีครับทุกท่าน,\n\nในยุคที่ทุกอย่างเปลี่ยนแปลงอย่างรวดเร็ว การมีเครื่องมือและแนวคิดที่ชัดเจนเปรียบเสมือนเข็มทิศนำทาง วันนี้เรามีความยินดีที่จะแบ่งปันแนวทางสำคัญที่จะช่วยให้คุณและทีมทำงานได้อย่างมีประสิทธิภาพยิ่งขึ้น:\n\n- **ความชัดเจน:** วางเป้าหมายที่วัดผลได้จริง\n- **ความคล่องตัว:** ปรับตัวและทดลองสิ่งใหม่อยู่เสมอ\n- **การร่วมมือ:** พลังของทีมที่สื่อสารกันอย่างเปิดกว้าง\n\n---\n\nคุณสามารถปรับน้ำเสียง (Tone of Voice) ให้เป็นทางการขึ้นหรือสนุกสนานขึ้นได้ตามต้องการเลยครับ หากต้องการเวอร์ชันภาษาอังกฤษหรือเพิ่ม Call to Action แจ้งได้เลย!`;
  }

  // Idea generation & Brainstorming
  if (prompt.includes('ไอเดีย') || prompt.includes('คิด') || prompt.includes('ตั้งชื่อ') || prompt.includes('วางแผน') || prompt.includes('แนะนำ')) {
    return `เป็นหัวข้อที่น่าสนใจมากครับ! ผมได้รวบรวม **4 ไอเดียหลัก** เพื่อให้คุณนำไปต่อยอดได้ทันที:\n\n1. **แนวทางที่ 1: Modern & Minimal**\n   - โฟกัสที่ความเรียบง่าย สบายตา สื่อสารตรงประเด็น เหมาะสำหรับกลุ่มคนรุ่นใหม่\n2. **แนวทางที่ 2: Interactive Experience**\n   - สร้างปฏิสัมพันธ์กับผู้ใช้ ให้มีส่วนร่วม เช่น การโหวต ควิซ หรือทดลองใช้งานฟรี\n3. **แนวทางที่ 3: Value-Driven (เน้นคุณค่า)**\n   - เน้นประโยชน์ที่ผู้ใช้จะได้รับอย่างแท้จริง ช่วยแก้ปัญหา Pain Point ได้ชัดเจน\n4. **แนวทางที่ 4: Community & Storytelling**\n   - เล่าเรื่องราวที่น่าประทับใจ ให้เกิดความรู้สึกผูกพันและอยากบอกต่อ\n\nมีแนวทางไหนที่ตรงใจเป็นพิเศษไหมครับ? ผมสามารถเจาะลึกรายละเอียดเพิ่มเติมให้ได้ครับ!`;
  }

  // Summary & Explanation
  if (prompt.includes('สรุป') || prompt.includes('อธิบาย') || prompt.includes('คืออะไร') || prompt.includes('แปลว่า')) {
    return `สรุปประเด็นสำคัญให้เข้าใจง่ายในเวลาไม่ถึง 1 นาทีครับ:\n\n### 📌 ใจความหลัก:\n- **สาระสำคัญ:** เรื่องนี้เน้นการจัดการและสร้างคุณค่าโดยมุ่งเป้าไปที่ผลลัพธ์ระยะยาว\n- **ข้อดีหลัก:** ประหยัดเวลา ลดความผิดพลาด และเพิ่มประสิทธิภาพอย่างเห็นได้ชัด\n- **ข้อควรระวัง:** ควรมีการทบทวนและปรับปรุงกระบวนการอย่างสม่ำเสมอ\n\n> 💡 **ข้อคิดน่าสนใจ:** ความสำเร็จไม่ได้มาจากความซับซ้อน แต่มาจากการลงมือทำสิ่งง่ายๆ อย่างต่อเนื่องและมีวินัยครับ`;
  }

  // Default smart conversational response
  return `สวัสดีครับ! ยินดีที่ได้พูดคุยกับคุณครับ สำหรับหัวข้อ **"${userPrompt}"** ที่คุณถามเข้ามา:\n\nผมพร้อมให้คำแนะนำและช่วยเหลือในทุกขั้นตอน ไม่ว่าจะเป็น:\n- ✍️ การเรียบเรียงและร่างข้อความ\n- 🔍 การค้นหาคำตอบและสรุปข้อมูล\n- 💡 การระดมความคิดสร้างสรรค์ใหม่ๆ\n- 💻 การเขียนโค้ดและแก้ปัญหาทางเทคนิค\n\nหากคุณต้องการให้ผมเจาะลึกในมุมไหน หรือมีข้อมูลเพิ่มเติมที่อยากแบ่งปัน สามารถพิมพ์บอกผมได้เลยครับ!`;
}

// Function to call the friend's backend at http://127.0.0.1:5000/api/chat
async function fetchFromBackend(userPrompt) {
  const settings = getSettings();
  const backendUrl = settings.backendUrl || process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api/chat';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12 seconds

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userPrompt }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.reply !== 'undefined') {
        return { success: true, reply: data.reply, url: backendUrl };
      }
    } else {
      try {
        const errorData = await response.json();
        const errorMsg = errorData.detail || errorData.error || `HTTP ${response.status}`;
        let helpfulTip = "";
        if (errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("403")) {
          helpfulTip = "\n\n💡 **วิธีแก้ให้เพื่อนทำ:** API Key ในเครื่องเพื่อนยังไม่ได้เปิดสิทธิ์ Generative Language API ให้เพื่อนเข้าไปที่ [Google AI Studio](https://aistudio.google.com/app/apikey) แล้วกด **Create API key -> Create API key in new project** แล้วนำคีย์ใหม่มาใส่";
        } else if (errorMsg.includes("model") || errorMsg.includes("404")) {
          helpfulTip = "\n\n💡 **วิธีแก้ให้เพื่อนทำ:** ชื่อโมเดลในโค้ดเพื่อนไม่ถูกต้อง ให้เพื่อนเปลี่ยนชื่อโมเดลเป็น `gemini-2.5-flash` หรือ `gemini-1.5-flash`";
        }
        return {
          success: true,
          reply: `⚠️ **หลังบ้านของเพื่อนส่ง Error กลับมา (HTTP ${response.status}):**\n\n\`\`\`text\n${errorMsg.substring(0, 350)}\n\`\`\`${helpfulTip}`,
          url: backendUrl
        };
      } catch (errJson) {}
    }
  } catch (error) {
    // Port 5000 not responding or down
  }

  return { success: false, url: backendUrl };
}

// ---------------- API Routes ----------------

// 1. Get Models
app.get('/api/models', (req, res) => {
  res.json([
    { id: 'maneega-1.5', name: 'Maneega 1.5', badge: 'ค่าเริ่มต้น', desc: 'รวดเร็ว ฉลาด เหมาะกับการใช้งานทั่วไป' },
    { id: 'maneega-2.0-pro', name: 'Maneega 2.0 Pro', badge: 'Pro', desc: 'คิดวิเคราะห์เชิงลึก เหมาะกับงานซับซ้อนและข้อมูลเยอะ' },
    { id: 'maneega-flash', name: 'Maneega Flash', badge: 'Fast', desc: 'ความเร็วสูงสุด ตอบทันใจ' }
  ]);
});

// 2. Check Backend 5000 Status
app.get('/api/backend-status', async (req, res) => {
  const settings = getSettings();
  const backendUrl = settings.backendUrl || process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api/chat';
  const healthUrl = backendUrl.replace('/api/chat', '/api/health');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    // Try GET /api/health first (as defined in friend's Flask code)
    let resp = await fetch(healthUrl, { method: "GET", signal: controller.signal }).catch(() => null);

    // Fallback to POST /api/chat if /api/health doesn't respond
    if (!resp || !resp.ok) {
      resp = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "ping" }),
        signal: controller.signal
      }).catch(() => null);
    }
    clearTimeout(timeout);

    if (resp && (resp.ok || resp.status < 500)) {
      return res.json({ online: true, url: backendUrl });
    }
  } catch (err) {}

  return res.json({ online: false, url: backendUrl });
});

// 3. Get All Chats
app.get('/api/chats', (req, res) => {
  const chats = readChats();
  const now = Date.now();
  const day = 86400000;

  const categorized = chats.map(c => {
    const chatTime = new Date(c.updatedAt || c.createdAt).getTime();
    let cat = 'older';
    if (now - chatTime < day) {
      cat = 'today';
    } else if (now - chatTime < day * 7) {
      cat = 'week';
    }
    return { ...c, category: cat };
  });

  res.json(categorized);
});

// 4. Create New Chat
app.post('/api/chats', (req, res) => {
  const chats = readChats();
  const newChat = {
    id: 'chat-' + Date.now(),
    title: req.body.title || 'แชตใหม่',
    category: 'today',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: req.body.messages || []
  };
  chats.unshift(newChat);
  writeChats(chats);
  res.json(newChat);
});

// 5. Get Chat by ID
app.get('/api/chats/:id', (req, res) => {
  const chats = readChats();
  const chat = chats.find(c => c.id === req.params.id);
  if (!chat) return res.status(404).json({ error: 'ไม่พบแชตนี้' });
  res.json(chat);
});

// 6. Update Chat
app.put('/api/chats/:id', (req, res) => {
  const chats = readChats();
  const index = chats.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'ไม่พบแชตนี้' });

  if (req.body.title) chats[index].title = req.body.title;
  chats[index].updatedAt = new Date().toISOString();
  writeChats(chats);
  res.json(chats[index]);
});

// 7. Delete Chat
app.delete('/api/chats/:id', (req, res) => {
  let chats = readChats();
  chats = chats.filter(c => c.id !== req.params.id);
  writeChats(chats);
  res.json({ success: true, message: 'ลบแชตเรียบร้อย' });
});

// 8. Chat Streaming / Response API (Connects to friend's backend on 5000 or internal fallback)
app.post('/api/chat', async (req, res) => {
  const { chatId, message, model = 'Maneega 1.5', stream = true, files = [] } = req.body;
  if (!message && files.length === 0) {
    return res.status(400).json({ error: 'ไม่มีข้อความ' });
  }

  const chats = readChats();
  let currentChat = chats.find(c => c.id === chatId);
  
  if (!currentChat) {
    const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
    currentChat = {
      id: chatId || ('chat-' + Date.now()),
      title: title || 'แชตใหม่',
      category: 'today',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    chats.unshift(currentChat);
  }

  // Add User Message
  const userMsg = {
    role: 'user',
    content: message,
    files: files || [],
    createdAt: new Date().toISOString()
  };
  currentChat.messages.push(userMsg);
  currentChat.updatedAt = new Date().toISOString();

  if (currentChat.messages.filter(m => m.role === 'user').length === 1 && currentChat.title === 'แชตใหม่') {
    currentChat.title = message.length > 32 ? message.substring(0, 32) + '...' : message;
  }

  // Attempt to call friend's backend at http://127.0.0.1:5000/api/chat
  let fullReply = '';
  let usedBackend = false;
  const backendResult = await fetchFromBackend(message);

  if (backendResult.success) {
    fullReply = backendResult.reply;
    usedBackend = true;
  } else {
    // Fallback to built-in generator
    fullReply = generateAIResponse(message, currentChat.messages, model);
  }

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream typewriter effect
    const chunks = fullReply.match(/[\s\S]{1,12}/g) || [fullReply];
    let i = 0;

    const interval = setInterval(() => {
      if (i < chunks.length) {
        res.write(`data: ${JSON.stringify({ chunk: chunks[i], done: false, fromBackend: usedBackend })}\n\n`);
        i++;
      } else {
        clearInterval(interval);
        res.write(`data: ${JSON.stringify({ done: true, fullText: fullReply, chatId: currentChat.id, fromBackend: usedBackend })}\n\n`);
        res.end();

        currentChat.messages.push({
          role: 'assistant',
          content: fullReply,
          fromBackend: usedBackend,
          createdAt: new Date().toISOString()
        });
        writeChats(chats);
      }
    }, 20);

    req.on('close', () => {
      clearInterval(interval);
    });
  } else {
    currentChat.messages.push({
      role: 'assistant',
      content: fullReply,
      fromBackend: usedBackend,
      createdAt: new Date().toISOString()
    });
    writeChats(chats);
    res.json({ reply: fullReply, chatId: currentChat.id, fromBackend: usedBackend });
  }
});

// 9. File Upload
app.post('/api/upload', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'ไม่มีไฟล์ที่อัปโหลด' });
  }

  const uploadedFiles = req.files.map(f => ({
    filename: f.filename,
    originalName: f.originalname,
    size: f.size,
    mimetype: f.mimetype,
    url: `/uploads/${f.filename}`
  }));

  res.json({ files: uploadedFiles });
});

// 10. Library
app.get('/api/library', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(LIBRARY_FILE, 'utf-8'));
    res.json(data);
  } catch {
    res.json([]);
  }
});

app.post('/api/library', (req, res) => {
  try {
    const library = JSON.parse(fs.readFileSync(LIBRARY_FILE, 'utf-8'));
    const newItem = {
      id: 'lib-' + Date.now(),
      title: req.body.title || 'คำสั่งลัดใหม่',
      prompt: req.body.prompt || ''
    };
    library.push(newItem);
    fs.writeFileSync(LIBRARY_FILE, JSON.stringify(library, null, 2), 'utf-8');
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถบันทึกได้' });
  }
});

// 11. Settings API
app.get('/api/settings', (req, res) => {
  res.json(getSettings());
});

app.post('/api/settings', (req, res) => {
  try {
    const current = getSettings();
    const updated = { ...current, ...req.body };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    res.json({ success: true, settings: updated });
  } catch {
    res.status(500).json({ error: 'บันทึกการตั้งค่าล้มเหลว' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Maneega AI Chat Server running at http://localhost:${PORT}`);
  console.log(`🔗 Backend Endpoint configured at: http://127.0.0.1:5000/api/chat`);
});
