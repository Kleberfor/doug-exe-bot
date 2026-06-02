# Deploy do Doug.EXE Bot no EasyPanel

## Passo 1: Subir o código para o GitHub

```bash
cd ~/projetos/skill-doug
git init
git add .
git commit -m "feat: Doug.EXE bot server"
git remote add origin https://github.com/SEU_USUARIO/doug-exe-bot.git
git push -u origin main
```

## Passo 2: Criar o App no EasyPanel

1. Acesse seu EasyPanel na Hostinger
2. Clique em **"New Service"** → **"App"**
3. Nome: `doug-exe-bot`
4. Source: **GitHub Repository**
5. Conecte seu repositório GitHub
6. Build Type: **Dockerfile**
7. Port: **3000**

## Passo 3: Variáveis de Ambiente

No EasyPanel, vá em **Environment** e adicione:

```
EVOLUTION_API_URL=https://evolutionapi-evolution.46qqpx.easypanel.host
EVOLUTION_API_KEY=xzxcEkfnUZ390n9LzIm1tBQRR5QqD0UJ
EVOLUTION_INSTANCE_NAME=doug-bot
LLM_PROVIDER=deepseek
LLM_API_URL=https://api.deepseek.com/v1/chat/completions
LLM_API_KEY=SUA_CHAVE_DEEPSEEK_AQUI
LLM_MODEL=deepseek-chat
PORT=3000
```

## Passo 4: Deploy

1. Clique em **"Deploy"** no EasyPanel
2. Aguarde o build completar
3. Verifique os logs para confirmar que o bot iniciou

## Passo 5: Criar a Instância na Evolution API

Após o deploy, acesse o bot para criar a instância automaticamente:

```bash
curl https://SEU-DOMINIO-DO-BOT/
```

Ou manualmente:

```bash
curl -X POST https://evolutionapi-evolution.46qqpx.easypanel.host/instance/create \
  -H "apikey: xzxcEkfnUZ390n9LzIm1tBQRR5QqD0UJ" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "doug-bot", "integration": "WHATSAPP-BAILEYS"}'
```

## Passo 6: Conectar WhatsApp

Acesse o QR Code:

```bash
curl https://evolutionapi-evolution.46qqpx.easypanel.host/instance/connect/doug-bot \
  -H "apikey: xzxcEkfnUZ390n9LzIm1tBQRR5QqD0UJ"
```

Ou acesse via browser: `https://evolutionapi-evolution.46qqpx.easypanel.host/manager`

## Passo 7: Configurar Webhook

O webhook será configurado automaticamente quando o bot iniciar.

Para configurar manualmente:

```bash
curl -X POST https://evolutionapi-evolution.46qqpx.easypanel.host/webhook/set/doug-bot \
  -H "apikey: xzxcEkfnUZ390n9LzIm1tBQRR5QqD0UJ" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "url": "https://SEU-DOMINIO-DO-BOT/webhook",
    "events": ["messages.upsert", "connection.update"],
    "webhookBase64": false
  }'
```

## Verificar Status

```bash
# Health check do bot
curl https://SEU-DOMINIO-DO-BOT/

# Listar instâncias
curl -H "apikey: xzxcEkfnUZ390n9LzIm1tBQRR5QqD0UJ" \
  https://evolutionapi-evolution.46qqpx.easypanel.host/instance/fetchInstances

# Status da conexão
curl -H "apikey: xzxcEkfnUZ390n9LzIm1tBQRR5QqD0UJ" \
  https://evolutionapi-evolution.46qqpx.easypanel.host/instance/connectionState/doug-bot
```
