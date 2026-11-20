import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApiError, GoogleGenAI } from '@google/genai';

dotenv.config({ path: ['.env.local', '.env'] });

interface StickEntry {
  id: number;
  grade: string;
  poem: string;
  basicMeaning: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sticksPath = path.resolve(__dirname, 'src/data/cheKungSticks.json');
const sticks: StickEntry[] = JSON.parse(fs.readFileSync(sticksPath, 'utf-8'));
const sticksById = new Map<number, StickEntry>(sticks.map((s) => [s.id, s]));

const SYSTEM_INSTRUCTION = `你是一位駐守香港沙田車公廟多年、學養深厚且富同理心的資深解簽師傅。
你精通車公靈簽九十六簽的古典詩意、歷史典故及「解曰／斷曰」精義，亦深明香港現代社會的生活實況（職場轉變、樓宇家庭、伴侶溝通、財務審慎、身心平衡）。

解簽原則與語調：
1. 全程使用地道、溫潤典雅的繁體中文（香港文化語境，以「善信」或「閣下」稱呼）。
2. 語氣莊重誠懇、務實中肯，給予鼓勵與安定人心的力量；既尊重傳統簽意吉凶，亦不作無謂恐嚇或誇張迷信之語。
3. 必須緊扣該簽的「簽號、簽等、四句簽詩、傳統解曰」作出詮釋，切忌空泛套話。
4. 直接針對善信的具體問題剖析，提供清晰、可落地實踐的人生建議：
   - 若為「上簽」：肯定順勢機遇，同時提醒戒驕戒躁、慎言積德、把握當下行動。
   - 若為「中簽」：點出先難後易或守正待時之理，指明需要留意或耐心等待的關鍵。
   - 若為「下簽」：誠實點出眼前阻滯或潛在風險（如急進破財、口舌誤會），並以「居安思危、暫守待變、修心行善」給予具體避險與轉念建議。

輸出結構（請直接使用以下三個小標題分段，內容簡潔有力、層次分明，不要使用多餘的星號或裝飾符號）：
【簽詩意蘊】
扼要解說四句簽詩與典故意象，並結合傳統解曰點出此簽核心啟示。

【針對問事剖析】
直接回應善信所問的具體處境，分析利弊、時機與需留神之處。

【車公師傅指引】
提供兩至三項具體、務實且向善的生活或處事建議，末句以簡短祝福作結。`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/interpret', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error:
            '尚未設定 GEMINI_API_KEY，無法連接 AI 解簽服務。請在專案根目錄的 .env.local 設定金鑰，並重新啟動伺服器；部署至 AI Studio 時，請在 Secrets 設定。',
        });
      }

      const { stickId, question } = req.body as {
        stickId?: number;
        question?: string;
      };

      const parsedId = Number(stickId);
      if (!Number.isInteger(parsedId) || parsedId < 1 || parsedId > 96) {
        return res.status(400).json({
          error: '請提供有效的車公靈簽簽號（1 至 96）。',
        });
      }

      const trimmedQuestion = (question ?? '').trim();
      if (!trimmedQuestion) {
        return res.status(400).json({
          error: '請先輸入您想向車公請教的問題或現況。',
        });
      }

      const stick = sticksById.get(parsedId);
      if (!stick) {
        return res.status(404).json({
          error: `找不到第 ${parsedId} 簽的資料。`,
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `善信求得沙田車公廟靈簽：
簽號：第 ${stick.id} 簽
簽等：${stick.grade}
簽詩：
${stick.poem}

傳統解曰與斷曰：
${stick.basicMeaning}

善信具體所問之事：
「${trimmedQuestion}」

請師傅依此簽詩意與傳統解曰，為善信詳細剖析所問之事並給予務實指引。`;

      const generateInterpretation = (model: string) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });

      const response = await generateInterpretation('gemini-4-hydrogen').catch(
        (error: unknown) => {
          if (!(error instanceof ApiError) || error.status !== 503) {
            throw error;
          }

          console.warn(
            'Gemini 4 Hydrogen is unavailable; retrying with Gemini 3.8 Flash.'
          );
          return generateInterpretation('gemini-3.8-flash');
        }
      );

      const interpretation = response.text?.trim();
      if (!interpretation) {
        return res.status(502).json({
          error: '暫時未能取得靈簽解析內容，請稍後再試。',
        });
      }

      return res.json({ interpretation });
    } catch (err: unknown) {
      console.error('Gemini interpretation error:', err);
      const message =
        err instanceof Error ? err.message : 'AI 解簽服務暫時繁忙，請稍後再試。';
      return res.status(500).json({
        error: `解簽時發生錯誤：${message}`,
      });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
