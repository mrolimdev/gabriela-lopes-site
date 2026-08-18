/**
 * Gabriela Lopes - Landing Page Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vip-form');
  const input = document.getElementById('contact-input');
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
        message: 'Por favor, informe seu e-mail para receber o convite VIP.' 
      };
    }
    
    // Expressão regular para e-mail padrão
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
   * Manipula o envio do formulário VIP
   */
  form.addEventListener('submit', (e) => {
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

    // Simulação de registro seguro assíncrono
    setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem('gl_vip_waitlist') || '[]');
        stored.push({
          contact: value.trim(),
          registeredAt: new Date().toISOString(),
          source: 'Landing Page Em Desenvolvimento'
        });
        localStorage.setItem('gl_vip_waitlist', JSON.stringify(stored));
      } catch (err) {
        console.warn('Armazenamento local indisponível:', err);
      }

      feedback.textContent = '✨ Solicitação confirmada com sucesso! Você receberá nosso convite VIP em primeira mão.';
      feedback.className = 'form-feedback success';
      input.value = '';
      input.blur();

      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Confirmado!</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      // Retornar ao estado original após alguns segundos
      setTimeout(() => {
        submitBtn.innerHTML = originalBtnHTML;
      }, 4500);
    }, 750);
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
