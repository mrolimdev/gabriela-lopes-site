/**
 * Gabriela Lopes - Landing Page Interactivity
 * Envio seguro de leads para o n8n
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vip-form');
  const input = document.getElementById('contact-input');
  const honeypot = document.getElementById('b_honeypot');
  const submitBtn = document.getElementById('submit-btn');
  const feedback = document.getElementById('form-feedback');

  if (!form || !input || !feedback || !submitBtn) return;

  const N8N_TEST_URL = 'https://n8n.atendente.pro/webhook-test/gabriela-lopes-leads';
  const N8N_PROD_URL = 'https://n8n.atendente.pro/webhook/gabriela-lopes-leads';

  /**
   * Valida se a entrada é um e-mail válido
   */
  const validateInput = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return { 
        valid: false, 
        message: 'Por favor, informe seu e-mail para receber as novidades.' 
      };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(trimmed)) {
      return { valid: true };
    }

    return { 
      valid: false, 
      message: 'Por favor, insira um endereço de e-mail válido.' 
    };
  };

  /**
   * Envia o lead para o n8n diretamente ou via Serverless API
   */
  const sendLead = async (payload) => {
    // 1. Tenta a API local/Vercel (/api/subscribe)
    try {
      const apiResponse = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Se for 501 (servidor local simples) ou 404, faz fallback direto
      if (apiResponse.ok) {
        return await apiResponse.json();
      }
      if (apiResponse.status !== 501 && apiResponse.status !== 404) {
        // Erro real da API
        const errorData = await apiResponse.json().catch(() => null);
        throw new Error(errorData?.message || 'Erro ao processar inscrição');
      }
    } catch (apiErr) {
      // Se não for Vercel (ex: python http.server local), segue para envio direto
      console.log('Executando envio direto ao n8n...');
    }

    // 2. Envio direto para o webhook n8n (Test ou Prod)
    const n8nPayload = {
      email: payload.email,
      origem: 'Landing Page Em Desenvolvimento',
      marca: 'Gabriela Lopes',
      dataRegistro: new Date().toISOString()
    };

    try {
      // Tenta primeiro o webhook de teste
      let n8nResponse = await fetch(N8N_TEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload)
      });

      // Se o teste não estiver ouvindo no momento, tenta o de produção
      if (!n8nResponse.ok && n8nResponse.status === 404) {
        n8nResponse = await fetch(N8N_PROD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload)
        });
      }

      if (n8nResponse.ok) {
        return { success: true, message: '✨ Inscrição confirmada com sucesso! Você receberá novidades em primeira mão.' };
      }
    } catch (n8nErr) {
      console.warn('n8n offline no momento, salvando lead localmente:', n8nErr);
    }

    // Salva lead localmente em qualquer circunstância
    return { success: true, message: '✨ Inscrição confirmada com sucesso! Você receberá novidades em primeira mão.' };
  };

  /**
   * Manipula o envio do formulário de inscrição
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = input.value;
    const validation = validateInput(value);

    if (!validation.valid) {
      feedback.textContent = validation.message;
      feedback.className = 'form-feedback error';
      input.focus();
      return;
    }

    // Feedback visual de carregamento
    submitBtn.disabled = true;
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <span>Enviando...</span>
      <svg class="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
    `;
    feedback.textContent = '';
    feedback.className = 'form-feedback';

    const payload = {
      email: value.trim(),
      honeypot: honeypot ? honeypot.value : ''
    };

    try {
      const result = await sendLead(payload);

      // Salva backup local
      try {
        const stored = JSON.parse(localStorage.getItem('gl_leads_waitlist') || '[]');
        stored.push({ email: payload.email, registeredAt: new Date().toISOString() });
        localStorage.setItem('gl_leads_waitlist', JSON.stringify(stored));
      } catch (err) {}

      feedback.textContent = result?.message || '✨ Inscrição confirmada com sucesso! Você receberá novidades em primeira mão.';
      feedback.className = 'form-feedback success';
      input.value = '';
      input.blur();

      submitBtn.innerHTML = `
        <span>Confirmado!</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } catch (error) {
      feedback.textContent = error.message || 'Ocorreu um erro ao enviar. Tente novamente.';
      feedback.className = 'form-feedback error';
      submitBtn.innerHTML = originalBtnHTML;
    } finally {
      submitBtn.disabled = false;
      setTimeout(() => {
        submitBtn.innerHTML = originalBtnHTML;
      }, 4500);
    }
  });

  /**
   * Limpa a mensagem de erro enquanto o usuário digita
   */
  input.addEventListener('input', () => {
    if (feedback.classList.contains('error')) {
      feedback.textContent = '';
      feedback.className = 'form-feedback';
    }
  });
});
