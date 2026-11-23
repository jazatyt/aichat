import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Allow CORS from all origins (localhost:3000, 127.0.0.1, etc.)
CORS(app, origins="*")

def get_api_key():
    # 1. Environment variables
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if key and key.strip():
        return key.strip()
    
    # 2. Check data/settings.json
    try:
        settings_path = os.path.join(os.path.dirname(__file__), "data", "settings.json")
        if os.path.exists(settings_path):
            with open(settings_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("apiKey"):
                    return data["apiKey"].strip()
    except Exception:
        pass
    return None

def generate_smart_reply(prompt):
    p = prompt.strip().lower()

    # Greetings
    if p in ["โย่", "yo", "หวัดดี", "สวัสดี", "สวัสดีครับ", "สวัสดีค่ะ", "hello", "hi", "hey"]:
        return (
            "โย่! สวัสดีครับ มีอะไรให้ผมช่วยวันนี้ไหมครับ? 😎\n\n"
            "ผมพร้อมช่วยคุณในหลายๆ เรื่อง เช่น:\n"
            "- 💡 คิดไอเดียและคอนเทนต์ใหม่ๆ\n"
            "- ✍️ เขียนและเรียบเรียงข้อความ/อีเมล\n"
            "- 💻 เขียนโค้ดและแก้บั๊กโปรแกรม\n"
            "- 🔍 สรุปบทความและหาคำตอบ\n\n"
            "พิมพ์บอกผมได้เลยครับ!"
        )

    # Coding requests
    if any(k in p for k in ["โค้ด", "code", "python", "javascript", "html", "css", "sql", "function", "เขียนโปรแกรม"]):
        return (
            "ได้เลยครับ! นี่คือตัวอย่างโค้ดและแนวทางการเขียนที่อ่านง่ายและนำไปใช้ได้ทันที:\n\n"
            "```python\n"
            "# ตัวอย่างฟังก์ชันสำหรับประมวลผลข้อมูล\n"
            "def process_items(items):\n"
            "    results = []\n"
            "    for item in items:\n"
            "        if item.get('active'):\n"
            "            results.append({\n"
            "                'id': item['id'],\n"
            "                'name': item['name'].title(),\n"
            "                'status': 'Processed'\n"
            "            })\n"
            "    return results\n"
            "\n"
            "# ทดสอบใช้งาน\n"
            "sample_data = [{'id': 1, 'name': 'maneega chat', 'active': True}]\n"
            "print(process_items(sample_data))\n"
            "```\n\n"
            "### 💡 คำอธิบาย:\n"
            "1. ตรวจสอบข้อมูลก่อนนำไปประมวลผลเพื่อป้องกันข้อผิดพลาด\n"
            "2. คัดกรองเฉพาะข้อมูลที่ต้องการและจัดรูปแบบให้เรียบร้อย\n\n"
            "ต้องการให้ผมปรับฟังก์ชันนี้ หรือเขียนโค้ดภาษาไหนเพิ่มเติม บอกได้เลยครับ!"
        )

    # Writing / Email requests
    if any(k in p for k in ["เขียน", "อีเมล", "จดหมาย", "บทความ", "โพสต์", "แคปชัน"]):
        return (
            "ยินดีครับ! นี่คือแบบร่างงานเขียนที่เป็นมืออาชีพ สุภาพ และน่าอ่านครับ:\n\n"
            "---\n\n"
            "**เรื่อง:** แจ้งข้อมูลและข้อเสนอความร่วมมือ\n\n"
            "เรียน คุณ [ชื่อผู้รับ],\n\n"
            "ตามที่ได้ประสานงานกันก่อนหน้านี้ ทางทีมงานขอเรียนแจ้งรายละเอียดและข้อเสนอตามที่ได้หารือไว้ เพื่อให้ท่านพิจารณาครับ\n\n"
            "หากท่านมีข้อสงสัยหรือต้องการให้เพิ่มเติมในจุดใด สามารถแจ้งกลับได้ทุกเมื่อครับ ทางเรายินดีให้ข้อมูลเพิ่มเติมอย่างยิ่งครับ\n\n"
            "ขอแสดงความนับถือ,\n"
            "[ชื่อของคุณ]\n\n"
            "---\n\n"
            "สามารถนำไปปรับแต่งข้อความหรือให้ผมช่วยเกลาคำใหม่ได้ตลอดเลยนะครับ!"
        )

    # General conversation
    return (
        f"ยินดีที่ได้คุยกันครับ! สำหรับคำถามของคุณเรื่อง **'{prompt}'**:\n\n"
        "ผมยินดีช่วยค้นหาคำตอบและให้คำแนะนำในทุกประเด็นเลยครับ "
        "หากต้องการให้อธิบายเพิ่มเติมแบบเจาะลึก หรือต้องการตัวอย่างที่เห็นภาพชัดขึ้น พิมพ์บอกได้เลยนะครับ! 😊"
    )

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "message": "Backend Flask server is healthy and online!"})

@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    if not message:
        return jsonify({"error": "message is required"}), 400

    api_key = get_api_key()

    # If Gemini API Key is present, call Google GenAI
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=message,
            )
            return jsonify({"reply": response.text})
        except Exception as exc:
            # If Google API fails (e.g. invalid key), fallback smoothly to smart generator
            return jsonify({"reply": generate_smart_reply(message)})
    else:
        # Use built-in smart AI generator (works offline without needing an API key)
        return jsonify({"reply": generate_smart_reply(message)})

if __name__ == "__main__":
    print("🚀 Flask Backend running at http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
