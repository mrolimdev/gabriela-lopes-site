/**
 * Vercel Serverless Function: /api/subscribe
 * 
 * Intermediador seguro (Proxy) para envio de leads ao n8n:
 * - Oculta a URL do n8n do navegador do cliente (evita scraping e spam)
 * - Validação de formato de e-mail e higienização no servidor
 * - Proteção Anti-Bot (Honeypot)
 * - Captura de metadados (data/hora, origem do lead)
 */

export default async function handler(req, res) {
  // Configuração de CORS para segurança de origens
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Resposta rápida para Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceita método POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use POST.'
    });
  }

  try {
    const { email, honeypot } = req.body || {};

    // 1. Verificação Honeypot (Se preenchido, é um bot - responde sucesso silenciosamente)
    if (honeypot) {
      return res.status(200).json({
        success: true,
        message: 'Inscrição confirmada com sucesso!'
      });
    }

    // 2. Validação rigorosa do e-mail
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Por favor, informe um endereço de e-mail.'
      });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, insira um e-mail válido.'
      });
    }

    // 3. Montagem do Payload Enriquecido para o n8n
    const leadPayload = {
      email: emailTrimmed,
      origem: 'Landing Page Em Desenvolvimento',
      marca: 'Gabriela Lopes',
      dataRegistro: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'Desconhecido',
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Desconhecido'
    };

    // 4. URL do Webhook n8n (Variável de Ambiente ou URL configurada)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.atendente.pro/webhook-test/gabriela-lopes-leads';

    if (n8nWebhookUrl) {
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GabrielaLopes-API/1.0'
          },
          body: JSON.stringify(leadPayload)
        });

        if (!n8nResponse.ok) {
          console.error('[n8n Webhook Error]:', n8nResponse.status, await n8nResponse.text());
        }
      } catch (webhookError) {
        console.error('[Falha ao comunicar com n8n]:', webhookError);
      }
    }

    // 5. Retorno de sucesso para o frontend
    return res.status(200).json({
      success: true,
      message: '✨ Inscrição confirmada com sucesso! Você receberá novidades em primeira mão.'
    });

  } catch (error) {
    console.error('[API Subscribe Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocorreu um erro interno ao processar sua inscrição. Tente novamente mais tarde.'
    });
  }
}
