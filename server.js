import express from 'express';
import axios from 'axios';
import { readFileSync, readdirSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carrega variáveis de ambiente do .env.bot (apenas local)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.bot') });

// ============================================
// Configuração
// ============================================

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'doug-bot';
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'deepseek';
const LLM_API_URL = process.env.LLM_API_URL;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-chat';
const PORT = process.env.PORT || 3000;

// ============================================
// Carregar SKILL.md e References
// ============================================

function loadDougSkill() {
  try {
    const skill = readFileSync('./doug-exe/SKILL.md', 'utf-8');

    const refsDir = './doug-exe/references';
    const refFiles = readdirSync(refsDir).filter(f => f.endsWith('.md'));
    const references = refFiles
      .map(f => readFileSync(`${refsDir}/${f}`, 'utf-8'))
      .join('\n\n---\n\n');

    return { skill, references };
  } catch (err) {
    console.error('Erro ao carregar SKILL.md ou references:', err.message);
    process.exit(1);
  }
}

const { skill: DOUG_SKILL, references: DOUG_REFS } = loadDougSkill();

// ============================================
// Memória de conversas (por usuário)
// ============================================

const conversations = new Map();

function getConversation(jid) {
  if (!conversations.has(jid)) {
    conversations.set(jid, []);
  }
  return conversations.get(jid);
}

function addToConversation(jid, role, content) {
  const conv = getConversation(jid);
  conv.push({ role, content });

  // Mantém apenas as últimas 20 mensagens para não estourar tokens
  if (conv.length > 20) {
    conv.splice(0, conv.length - 20);
  }
}

// ============================================
// Chamar LLM
// ============================================

async function callLLM(userMessage, jid) {
  addToConversation(jid, 'user', userMessage);
  const history = getConversation(jid);

  if (LLM_PROVIDER === 'claude') {
    return callClaude(history);
  }
  return callDeepSeek(history);
}

async function callDeepSeek(history) {
  try {
    const response = await axios.post(
      LLM_API_URL,
      {
        model: LLM_MODEL,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: DOUG_SKILL + '\n\n---\n\n# REFERÊNCIAS DE CONTEÚDO\n\n' + DOUG_REFS },
          ...history
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${LLM_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const assistantMessage = response.data.choices[0].message.content;
    addToConversation(history[history.length - 1]?.jid || 'unknown', 'assistant', assistantMessage);
    return assistantMessage;
  } catch (err) {
    console.error('Erro DeepSeek:', err.response?.data || err.message);
    return 'Desculpe, tive um problema técnico. Tente novamente em instantes.';
  }
}

async function callClaude(history) {
  try {
    const response = await axios.post(
      LLM_API_URL,
      {
        model: LLM_MODEL,
        max_tokens: 2048,
        system: DOUG_SKILL + '\n\n---\n\n# REFERÊNCIAS DE CONTEÚDO\n\n' + DOUG_REFS,
        messages: history
      },
      {
        headers: {
          'x-api-key': LLM_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const assistantMessage = response.data.content[0].text;
    return assistantMessage;
  } catch (err) {
    console.error('Erro Claude:', err.response?.data || err.message);
    return 'Desculpe, tive um problema técnico. Tente novamente em instantes.';
  }
}

// ============================================
// Enviar mensagem via Evolution API
// ============================================

async function sendWhatsAppMessage(number, text) {
  try {
    await axios.post(
      `${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`,
      {
        number,
        text
      },
      {
        headers: { apikey: API_KEY }
      }
    );
    console.log(`✅ Mensagem enviada para ${number}`);
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err.response?.data || err.message);
  }
}

// ============================================
// Criar instância na Evolution API
// ============================================

async function createInstance() {
  try {
    console.log(`🔍 Verificando se instância "${INSTANCE_NAME}" existe...`);
    const instances = await axios.get(
      `${EVOLUTION_URL}/instance/fetchInstances`,
      { headers: { apikey: API_KEY } }
    );

    const exists = instances.data.some(i => i.name === INSTANCE_NAME);
    if (exists) {
      console.log(`✅ Instância "${INSTANCE_NAME}" já existe.`);
      return true;
    }

    console.log(`📦 Criando instância "${INSTANCE_NAME}"...`);
    await axios.post(
      `${EVOLUTION_URL}/instance/create`,
      {
        instanceName: INSTANCE_NAME,
        integration: 'WHATSAPP-BAILEYS'
      },
      {
        headers: {
          apikey: API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Instância "${INSTANCE_NAME}" criada com sucesso!`);
    console.log(`📱 Acesse o QR Code em: ${EVOLUTION_URL}/instance/connect/${INSTANCE_NAME}`);
    return true;
  } catch (err) {
    console.error('Erro ao criar instância:', err.response?.data || err.message);
    return false;
  }
}

// ============================================
// Configurar Webhook
// ============================================

async function setupWebhook() {
  try {
    const webhookUrl = `http://localhost:${PORT}/webhook`;
    console.log(`🔗 Configurando webhook para ${webhookUrl}...`);

    await axios.post(
      `${EVOLUTION_URL}/webhook/set/${INSTANCE_NAME}`,
      {
        enabled: true,
        url: webhookUrl,
        events: ['messages.upsert', 'connection.update'],
        webhookBase64: false
      },
      {
        headers: {
          apikey: API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Webhook configurado!');
  } catch (err) {
    console.error('Erro ao configurar webhook:', err.response?.data || err.message);
  }
}

// ============================================
// Servidor Express
// ============================================

const app = express();
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: 'Doug.EXE',
    version: '1.0.0',
    instance: INSTANCE_NAME,
    llm: LLM_PROVIDER
  });
});

// Webhook receiver
app.post('/webhook', async (req, res) => {
  const { event, instance, data } = req.body;

  // Log básico
  console.log(`📩 Evento: ${event} | Instância: ${instance}`);

  // Ignora mensagens enviadas pelo próprio bot
  if (data?.key?.fromMe) {
    return res.sendStatus(200);
  }

  if (event === 'messages.upsert') {
    const userMessage =
      data?.message?.conversation ||
      data?.message?.extendedTextMessage?.text ||
      '';

    const remoteJid = data?.key?.remoteJid;

    if (!userMessage || !remoteJid) {
      return res.sendStatus(200);
    }

    console.log(`💬 Mensagem de ${remoteJid}: ${userMessage}`);

    try {
      // Chama o LLM com o Doug como persona
      const llmResponse = await callLLM(userMessage, remoteJid);

      // Envia a resposta
      await sendWhatsAppMessage(remoteJid, llmResponse);
    } catch (err) {
      console.error('Erro no processamento:', err.message);
    }
  }

  if (event === 'connection.update') {
    console.log(`🔄 Status da conexão: ${data?.state || 'desconhecido'}`);
  }

  res.sendStatus(200);
});

// ============================================
// Iniciar servidor
// ============================================

app.listen(PORT, async () => {
  console.log('');
  console.log('🤖 ============================================');
  console.log('🤖  Doug.EXE Bot - Mentoria em Marketing Digital');
  console.log('🤖 ============================================');
  console.log('');
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Evolution API: ${EVOLUTION_URL}`);
  console.log(`🧠 LLM: ${LLM_PROVIDER} (${LLM_MODEL})`);
  console.log(`📱 Instância: ${INSTANCE_NAME}`);
  console.log('');

  // Verifica/cria instância
  await createInstance();
})();
