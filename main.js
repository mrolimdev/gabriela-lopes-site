/**
 * Gabriela Lopes - Landing Page Interactivity
 * Envio seguro de leads para o n8n via Serverless API (/api/subscribe)
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vip-form');
  const input = document.getElementById('contact-input');
  const honeypot = document.getElementById('b_honeypot');
  const submitBtn = document.getElementById('submit-btn');
  const feedback = document.getElementById('form-feedback');

  if (!form || !input || !feedback || !submitBtn) return;

  /**
   * Sanitiza strings para exibição segura no DOM
   */
  const escapeHtml = (str) => {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  };

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
   * Renderiza a mensagem de sucesso moderna substituindo o box do formulário
   */
  const renderSuccessState = (email) => {
    form.innerHTML = `
      <div class="success-card">
        <div class="success-icon-wrapper">
          <div class="success-glow"></div>
          <svg class="success-check-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 class="success-title">Inscrição Confirmada!</h3>
        <p class="success-text">Você receberá as novidades e o acesso antecipado em primeira mão.</p>
        <div class="success-email-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>${escapeHtml(email)}</span>
        </div>
      </div>
    `;
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
      // Envio para o proxy seguro /api/subscribe (que encaminha ao n8n)
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (jsonErr) {}

      // Salva backup local
      try {
        const stored = JSON.parse(localStorage.getItem('gl_leads_waitlist') || '[]');
        stored.push({
          email: payload.email,
          registeredAt: new Date().toISOString(),
          synced: response.ok
        });
        localStorage.setItem('gl_leads_waitlist', JSON.stringify(stored));
      } catch (storageErr) {}

      if (response.ok) {
        // Substitui o box do formulário pelo card de sucesso moderno
        renderSuccessState(payload.email);
      } else {
        feedback.textContent = responseData?.message || 'Ocorreu um erro ao processar. Tente novamente.';
        feedback.className = 'form-feedback error';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    } catch (networkError) {
      console.error('Erro de conexão:', networkError);
      
      // Fallback gracioso com armazenamento local e sucesso
      try {
        const stored = JSON.parse(localStorage.getItem('gl_leads_waitlist') || '[]');
        stored.push({ email: payload.email, registeredAt: new Date().toISOString(), synced: false });
        localStorage.setItem('gl_leads_waitlist', JSON.stringify(stored));
      } catch (e) {}

      renderSuccessState(payload.email);
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
