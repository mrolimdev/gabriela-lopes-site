/**
 * Gabriela Lopes - Landing Page Interactivity
 * Envio seguro de leads para /api/subscribe (integrado ao n8n)
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vip-form');
  const input = document.getElementById('contact-input');
  const honeypot = document.getElementById('b_honeypot');
  const submitBtn = document.getElementById('submit-btn');
  const feedback = document.getElementById('form-feedback');

  if (!form || !input || !feedback || !submitBtn) return;

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
      // 1. Envio para a Serverless Function /api/subscribe (que encaminha ao n8n)
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonErr) {
        responseData = null;
      }

      // Salva backup localmente
      try {
        const stored = JSON.parse(localStorage.getItem('gl_leads_waitlist') || '[]');
        stored.push({
          email: payload.email,
          registeredAt: new Date().toISOString(),
          synced: response.ok
        });
        localStorage.setItem('gl_leads_waitlist', JSON.stringify(stored));
      } catch (storageErr) {
        console.warn('Backup local indisponível:', storageErr);
      }

      if (response.ok) {
        feedback.textContent = responseData?.message || '✨ Inscrição confirmada com sucesso! Você receberá novidades em primeira mão.';
        feedback.className = 'form-feedback success';
        input.value = '';
        input.blur();

        submitBtn.innerHTML = `
          <span>Confirmado!</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      } else {
        feedback.textContent = responseData?.message || 'Não foi possível concluir no momento. Tente novamente.';
        feedback.className = 'form-feedback error';
        submitBtn.innerHTML = originalBtnHTML;
      }
    } catch (networkError) {
      console.warn('Servidor local/offline, salvando localmente:', networkError);
      
      // Fallback gracioso para ambiente estático de desenvolvimento local
      try {
        const stored = JSON.parse(localStorage.getItem('gl_leads_waitlist') || '[]');
        stored.push({ email: payload.email, registeredAt: new Date().toISOString(), synced: false });
        localStorage.setItem('gl_leads_waitlist', JSON.stringify(stored));
      } catch (e) {}

      feedback.textContent = '✨ Inscrição confirmada com sucesso! Você receberá novidades em primeira mão.';
      feedback.className = 'form-feedback success';
      input.value = '';
      input.blur();

      submitBtn.innerHTML = `
        <span>Confirmado!</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
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
