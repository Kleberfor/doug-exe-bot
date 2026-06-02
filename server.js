import express from 'express';
import axios from 'axios';
import { readFileSync, readdirSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.bot') });

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'doug-bot';
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'deepseek';
const LLM_API_URL = process.env.LLM_API_URL;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-chat';
const PORT = process.env.PORT || 3000;

// IDs de mensagens já processadas (evita duplicatas)
const processedMessages = new Set();

function loadDougSkill() {
  try {
    const skill = readFileSync('./doug-exe/SKILL.md', 'utf-8');
    const refsDir = './doug-exe/references';
    const refFiles = readdirSync(refsDir).filter(f => f.endsWith('.md'));
    const references = refFiles.map(f => readFileSync(`${refsDir}/${f}`, 'utf-8')).join('\n\n---\n\n');
    return { skill, references };
  } catch (err) {
    console.error('Erro ao carregar SKILL.md:', err.message);
    process.exit(1);
  }
}

const { skill: DOUG_SKILL, references: DOUG_REFS } = loadDougSkill();
const SYSTEM_PROMPT = DOUG_SKILL + '\n\n---\n\n# REFERÊNCIAS\n\n' + DOUG_REFS;

const conversations = new Map();

function getConversation(jid) {
  if (!conversations.has(jid)) conversations.set(jid, []);
  return conversations.get(jid);
}

function addToConversation(jid, role, content) {
  const conv = getConversation(jid);
  conv.push({ role, content });
  if (conv.length > 20) conv.splice(0, conv.length - 20);
}

async function callLLM(userMessage, jid) {
  addToConversation(jid, 'user', userMessage);
  const history = getConversation(jid);
  if (LLM_PROVIDER === 'claude') return callClaude(history, jid);
  return callDeepSeek(history, jid);
}

async function callDeepSeek(history, jid) {
  try {
    const response = await axios.post(LLM_API_URL, {
      model: LLM_MODEL,
      max_tokens: 2048,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history]
    }, { headers: { 'Authorization': `Bearer ${LLM_API_KEY}`, 'Content-Type': 'application/json' } });
    const msg = response.data.choices[0].message.content;
    addToConversation(jid, 'assistant', msg);
    return msg;
  } catch (err) {
    console.error('Erro DeepSeek:', err.response?.data || err.message);
    return 'Erro técnico. Tente novamente.';
  }
}

async function callClaude(history, jid) {
  try {
    const response = await axios.post(LLM_API_URL, {
      model: LLM_MODEL, max_tokens: 2048, system: SYSTEM_PROMPT, messages: history
    }, { headers: { 'x-api-key': LLM_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' } });
    const msg = response.data.content[0].text;
    addToConversation(jid, 'assistant', msg);
    return msg;
  } catch (err) {
    console.error('Erro Claude:', err.response?.data || err.message);
    return 'Erro técnico. Tente novamente.';
  }
}

async function sendWhatsAppMessage(number, text) {
  try {
    await axios.post(`${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`,
      { number, text }, { headers: { apikey: API_KEY } });
    console.log(`✅ Enviado para ${number}`);
  } catch (err) {
    console.error('Erro ao enviar:', err.response?.data || err.message);
  }
}

async function createInstance() {
  try {
    const instances = await axios.get(`${EVOLUTION_URL}/instance/fetchInstances`, { headers: { apikey: API_KEY } });
    const exists = instances.data.some(i => i.name === INSTANCE_NAME);
    if (exists) {
      console.log(`✅ Instância "${INSTANCE_NAME}" já existe.`);
    } else {
      await axios.post(`${EVOLUTION_URL}/instance/create`,
        { instanceName: INSTANCE_NAME, integration: 'WHATSAPP-BAILEYS' },
        { headers: { apikey: API_KEY, 'Content-Type': 'application/json' } });
      console.log(`✅ Instância criada!`);
    }
  } catch (err) {
    console.error('Erro instância:', err.response?.data || err.message);
  }
}

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'online', bot: 'Doug.EXE', version: '1.2.0', instance: INSTANCE_NAME, llm: LLM_PROVIDER });
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const { event, data } = req.body;

  if (event === 'MESSAGES_UPSERT' || event === 'messages.upsert') {
    // Ignora mensagens enviadas pelo próprio bot
    if (data?.key?.fromMe) {
      console.log('⏭️  Mensagem própria, ignorando.');
      return;
    }

    // Ignora mensagens duplicadas
    const msgId = data?.key?.id;
    if (msgId) {
      if (processedMessages.has(msgId)) {
        console.log(`⏭️  Mensagem ${msgId} já processada, ignorando.`);
        return;
      }
      processedMessages.add(msgId);
      // Limpa o cache após 10 minutos para não vazar memória
      setTimeout(() => processedMessages.delete(msgId), 10 * 60 * 1000);
    }

    const userMessage =
      data?.message?.conversation ||
      data?.message?.extendedTextMessage?.text ||
      data?.message?.imageMessage?.caption || '';

    const remoteJid = data?.key?.remoteJid;

    if (!userMessage || !remoteJid) return;

    console.log(`📩 [${remoteJid}]: ${userMessage}`);

    try {
      const reply = await callLLM(userMessage, remoteJid);
      await sendWhatsAppMessage(remoteJid, reply);
    } catch (err) {
      console.error('Erro:', err.message);
    }
  }

  if (event === 'CONNECTION_UPDATE' || event === 'connection.update') {
    console.log(`🔄 Conexão: ${data?.state}`);
  }
});

app.listen(PORT, async () => {
  console.log(`🤖 Doug.EXE v1.2.0 rodando na porta ${PORT}`);
  console.log(`📡 Evolution: ${EVOLUTION_URL} | LLM: ${LLM_PROVIDER}`);
  await createInstance();
});
