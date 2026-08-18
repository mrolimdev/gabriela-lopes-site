# Spec: Gabriela Lopes Landing Page "Em Desenvolvimento"

**Data:** 2026-08-18  
**Status:** Aprovado  
**Tipo:** Landing Page Institucional / Pré-Lançamento  

---

## 1. Visão Geral
Criação de uma landing page sofisticada, moderna e 100% responsiva para a marca **Gabriela Lopes**, comunicando que o site oficial e a nova coleção de óculos e vestuário estão em desenvolvimento.

O design seguirá uma estética **Editorial Luxo & Minimalista**, utilizando os elementos oficiais da identidade visual (paleta de cores em tons de marrom, nude e creme, logotipos em alta definição e fotografia editorial da marca).

---

## 2. Identidade Visual e Recursos

### 2.1 Paleta de Cores
- **Fundo Principal (Dark Warm Brown):** `#1F130B` a `#2E1C11`
- **Marrom Escuro Oficial:** `#714214`
- **Marrom / Caramelo Oficial:** `#AA7445`
- **Nude Sofisticado:** `#E6AA76`
- **Creme / Champagne:** `#EFC094`
- **Branco Quente / Texto Primário:** `#FAF6F0`
- **Texto Secundário / Mutado:** `rgba(239, 192, 148, 0.7)`

### 2.2 Tipografia
- **Títulos / Editorial Display:** Cormorant Garamond & Playfair Display (Google Fonts)
- **Subtítulos / Corpo / UI:** Plus Jakarta Sans & Montserrat (Google Fonts)

### 2.3 Ativos de Mídia
- **Logotipo:** `identidadevisual/CREME (SEM FUNDO).png` (otimizado para fundos escuros e terrosos)
- **Foto Principal:** `identidadevisual/foto.webp` (foto editorial com a modelo usando óculos escuros)
- **Selo da Marca:** `identidadevisual/FUNDO MARROM (PNG).png`

---

## 3. Arquitetura de Informação e Componentes

### 3.1 Painel Esquerdo: Conteúdo Editorial e Ação
1. **Cabeçalho:**
   - Logotipo da Gabriela Lopes com proporção equilibrada e visual nítido.
2. **Badge de Status:**
   - Pílula translúcida com brilho sutil: `NOVA COLEÇÃO • EM DESENVOLVIMENTO`.
3. **Bloco de Mensagem:**
   - Título: *"A sofisticação que redefine o seu olhar está sendo preparada."*
   - Slogan oficial em destaque: *"Seu olhar, sua assinatura."*
   - Texto de apoio destacando a proposta de valor: exclusividade, inovação e elegância em acessórios e vestuário.
4. **Formulário Lista VIP / Lançamento:**
   - Campo de entrada estilizado para e-mail ou WhatsApp do cliente.
   - Botão de ação com gradiente dourado/nude metálico (*"Quero Acesso VIP"*).
   - Feedback instantâneo com mensagem de sucesso elegante.
5. **Rodapé / Contato:**
   - Links para canais oficiais (Instagram, WhatsApp).
   - Selo discreto de direitos reservados.

### 3.2 Painel Direito: Exibição Visual
- Card visual imersivo com a fotografia editorial (`foto.webp`).
- Efeito de iluminação suave (*glow* sutil) e moldura refinada.
- Badge flutuante em vidro fosco (*glassmorphism*): *"GL Exclusive Collection • 2026"*.

---

## 4. Responsividade e Performance
- **Mobile First e Desktop Ultrawide:** Adaptação fluida via CSS Grid e Flexbox com tipografia em `clamp()`.
- **Animações:** Transições suaves em CSS puro (`cubic-bezier`), micro-interações nos botões e inputs.
- **Acessibilidade & SEO:** Tags semânticas HTML5, atributos ARIA, contraste cromático validado (WCAG AA), meta tags Open Graph e favicon.

---

## 5. Estrutura de Arquivos
- `index.html` — Estrutura semântica da página.
- `style.css` — Sistema de design, tokens CSS, layout responsivo e animações.
- `main.js` — Interatividade do formulário de lista VIP, efeitos e toasts.
- `identidadevisual/` — Pasta contendo os ativos originais da marca.
