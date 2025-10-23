// renderer/dom-hud.js — DOM HUD rendering with ASX aesthetic
export function createHud(root) {
  let currentContent = null;

  // Utility: Create element with styles
  function createElement(tag, styles = {}, attrs = {}) {
    const el = document.createElement(tag);
    Object.assign(el.style, styles);
    Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
    return el;
  }

  // Apply scanlines overlay
  function createScanlines() {
    const scanlines = createElement('div', {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '1000',
      background: `repeating-linear-gradient(
        0deg,
        rgba(0, 255, 255, 0.03) 0px,
        rgba(0, 255, 255, 0.03) 1px,
        transparent 1px,
        transparent 2px
      )`
    });
    return scanlines;
  }

  function renderHUD(hud, ctx) {
    clear();
    
    const container = createElement('div', {
      position: 'absolute',
      inset: '0',
      padding: '20px',
      overflow: 'auto',
      pointerEvents: 'auto'
    });

    // Add scanlines
    const scanlines = createScanlines();
    container.appendChild(scanlines);

    const content = hud.content;
    if (!content) return;

    // Render based on content type
    switch (content.type) {
      case 'dashboard':
        container.appendChild(renderDashboard(content));
        break;
      case 'store':
        container.appendChild(renderStore(content, ctx));
        break;
      case 'chat':
        container.appendChild(renderChat(content, ctx));
        break;
      case 'menu':
        container.appendChild(renderMenu(content));
        break;
      case 'scene-info':
        container.appendChild(renderSceneInfo(content));
        break;
      case 'status':
        container.appendChild(renderStatus(content));
        break;
      case 'diagnostics':
        container.appendChild(renderDiagnostics(content));
        break;
    }

    root.appendChild(container);
    currentContent = container;

    // Return cleanup function
    return () => {
      if (currentContent && currentContent.parentNode) {
        currentContent.parentNode.removeChild(currentContent);
      }
    };
  }

  function renderDashboard(content) {
    const grid = createElement('div', {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px'
    });

    content.cards.forEach(card => {
      const cardEl = createElement('div', {
        background: 'rgba(0, 20, 20, 0.9)',
        border: '2px solid #00ffff',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%)',
        padding: '30px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'
      });

      cardEl.innerHTML = `
        <div style="font-size: 3em; text-align: center; margin-bottom: 15px; filter: drop-shadow(0 0 10px #00ffff);">${card.icon}</div>
        <h2 style="font-family: 'Orbitron', monospace; font-size: 1.6em; color: #00ffff; text-transform: uppercase; text-align: center; margin-bottom: 15px; text-shadow: 0 0 10px #00ffff;">${card.title}</h2>
        <p style="color: #00cccc; text-align: center; line-height: 1.6;">${card.description}</p>
      `;

      cardEl.addEventListener('mouseenter', () => {
        cardEl.style.transform = 'translateY(-8px)';
        cardEl.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.8)';
      });

      cardEl.addEventListener('mouseleave', () => {
        cardEl.style.transform = 'translateY(0)';
        cardEl.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
      });

      cardEl.addEventListener('click', () => {
        window.location.hash = card.link;
      });

      grid.appendChild(cardEl);
    });

    return grid;
  }

  function renderStore(content, ctx) {
    const wrapper = createElement('div', {
      maxWidth: '1400px',
      margin: '0 auto'
    });

    // Hero section
    if (content.hero) {
      const hero = createElement('div', {
        background: 'rgba(0, 30, 30, 0.9)',
        border: '2px solid #00ffff',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)',
        padding: '60px 40px',
        textAlign: 'center',
        marginBottom: '40px',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)'
      });

      hero.innerHTML = `
        <h2 style="font-family: 'Orbitron', monospace; font-size: 3em; font-weight: 900; text-transform: uppercase; color: #00ffff; text-shadow: 0 0 15px #00ffff; margin-bottom: 20px;">${content.hero.title}</h2>
        <p style="font-size: 1.3em; color: #00cccc; margin-bottom: 30px;">${content.hero.subtitle}</p>
      `;

      wrapper.appendChild(hero);
    }

    // Products grid
    const grid = createElement('div', {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
      padding: '20px'
    });

    content.products.forEach(product => {
      const card = createElement('div', {
        background: 'rgba(0, 20, 20, 0.9)',
        border: '2px solid #00ffff',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%)',
        padding: '25px',
        transition: 'all 0.3s ease',
        boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'
      });

      card.innerHTML = `
        <div style="font-size: 3em; text-align: center; margin-bottom: 15px;">${product.icon}</div>
        <h3 style="font-family: 'Orbitron', monospace; font-size: 1.5em; color: #00ffff; text-transform: uppercase; margin-bottom: 10px;">${product.name}</h3>
        <p style="color: #00cccc; margin-bottom: 15px; line-height: 1.5;">${product.description}</p>
        <div style="font-family: 'Orbitron', monospace; font-size: 1.8em; font-weight: 700; color: #00ff00; margin-bottom: 15px;">$${product.price.toFixed(2)}</div>
        <button style="font-family: 'Orbitron', monospace; width: 100%; background: rgba(0, 50, 0, 0.9); color: #00ff00; border: 2px solid #00ff00; padding: 12px; cursor: pointer; text-transform: uppercase; font-weight: 700;">ADD TO CART</button>
      `;

      card.querySelector('button').addEventListener('click', () => {
        ctx.asx.runtime.dispatchInput('addToCart', product.id);
      });

      grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    return wrapper;
  }

  function renderChat(content, ctx) {
    const wrapper = createElement('div', {
      display: 'flex',
      height: '100%',
      maxHeight: 'calc(100vh - 120px)'
    });

    // Sidebar
    const sidebar = createElement('div', {
      width: '300px',
      background: 'rgba(0, 20, 20, 0.95)',
      borderRight: '2px solid #00ffff',
      padding: '20px',
      overflowY: 'auto'
    });

    const sidebarHTML = `
      <h3 style="font-family: 'Orbitron', monospace; color: #00ff00; margin-bottom: 15px; text-transform: uppercase;">📚 GUIDE</h3>
      <ul style="list-style: none; margin-bottom: 25px;">
        ${content.sidebar.guide.map(item => `<li style="margin-bottom: 8px; padding: 8px; background: rgba(0, 40, 40, 0.5); border-left: 3px solid #00cccc; color: #00cccc; font-size: 0.9em;">${item}</li>`).join('')}
      </ul>
      <h3 style="font-family: 'Orbitron', monospace; color: #00ff00; margin-bottom: 15px; text-transform: uppercase;">💡 EXAMPLES</h3>
      <ul style="list-style: none;">
        ${content.sidebar.examples.map(item => `<li style="margin-bottom: 8px; padding: 8px; background: rgba(0, 40, 40, 0.5); border-left: 3px solid #00cccc; color: #00cccc; font-size: 0.9em;">"${item}"</li>`).join('')}
      </ul>
    `;
    sidebar.innerHTML = sidebarHTML;

    // Chat area
    const chatArea = createElement('div', {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    });

    const messages = createElement('div', {
      flex: '1',
      overflowY: 'auto',
      marginBottom: '20px',
      padding: '15px',
      background: 'rgba(0, 10, 10, 0.8)',
      border: '2px solid #00ffff',
      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)'
    });

    content.messages.forEach(msg => {
      const msgEl = createElement('div', {
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(0, 30, 30, 0.9)',
        border: msg.role === 'system' ? '2px solid #ffff00' : '2px solid #00cccc',
        clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)'
      });

      msgEl.innerHTML = `
        <div style="font-family: 'Orbitron', monospace; color: ${msg.role === 'system' ? '#ffff00' : '#00ffff'}; margin-bottom: 8px; text-transform: uppercase; font-weight: 700;">${msg.role.toUpperCase()}</div>
        <div style="color: #00cccc; line-height: 1.6;">${msg.content}</div>
      `;

      messages.appendChild(msgEl);
    });

    chatArea.appendChild(messages);
    wrapper.appendChild(sidebar);
    wrapper.appendChild(chatArea);
    
    return wrapper;
  }

  function renderMenu(content) {
    const grid = createElement('div', {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '25px',
      maxWidth: '1200px',
      margin: '60px auto',
      padding: '20px'
    });

    content.items.forEach(item => {
      const card = createElement('div', {
        background: 'rgba(0, 20, 20, 0.9)',
        border: '2px solid #00ffff',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%)',
        padding: '40px',
        cursor: 'pointer',
        textAlign: 'center'
      });

      card.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">${item.icon}</div>
        <h2 style="font-family: 'Orbitron', monospace; font-size: 1.8em; color: #00ffff; margin-bottom: 15px; text-transform: uppercase;">${item.title}</h2>
        <p style="color: #00cccc; line-height: 1.6;">${item.description}</p>
      `;

      card.addEventListener('click', () => {
        window.location.hash = item.link;
      });

      grid.appendChild(card);
    });

    return grid;
  }

  function renderSceneInfo(content) {
    const panel = createElement('div', {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0, 20, 20, 0.95)',
      border: '2px solid #00ff00',
      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
      padding: '20px',
      minWidth: '300px',
      boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
      pointerEvents: 'auto'
    });

    panel.innerHTML = `
      <h3 style="font-family: 'Orbitron', monospace; font-size: 1.3em; color: #00ff00; margin-bottom: 10px; text-transform: uppercase;">${content.title}</h3>
      ${content.info.map(line => `<p style="color: #00cccc; margin-bottom: 5px;"><strong>${line.split(':')[0]}:</strong> ${line.split(':')[1]}</p>`).join('')}
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #00ffff; color: #00ffff; font-size: 0.9em;">
        ${content.controls.join('<br>')}
      </div>
    `;

    return panel;
  }

  function renderStatus(content) {
    const panel = createElement('div', {
      position: 'absolute',
      top: '80px',
      right: '20px',
      background: 'rgba(0, 20, 20, 0.95)',
      border: '2px solid #ffff00',
      clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
      padding: '15px',
      minWidth: '250px',
      boxShadow: '0 0 20px rgba(255, 255, 0, 0.5)',
      pointerEvents: 'none'
    });

    const statusHTML = `
      <h4 style="font-family: 'Orbitron', monospace; color: #ffff00; margin-bottom: 10px; text-transform: uppercase;">${content.title}</h4>
      ${content.status.map(item => `
        <div style="color: #00cccc; margin-bottom: 5px; font-size: 0.95em;">
          ${item.label}: <span style="color: ${item.color === 'success' ? '#00ff00' : '#00ffff'}; font-weight: bold;">${item.value}</span>
        </div>
      `).join('')}
    `;

    panel.innerHTML = statusHTML;
    return panel;
  }

  function renderDiagnostics(content) {
    const grid = createElement('div', {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '25px',
      maxWidth: '1400px',
      margin: '20px auto',
      padding: '20px'
    });

    content.sections.forEach(section => {
      const card = createElement('div', {
        background: 'rgba(0, 20, 20, 0.95)',
        border: '2px solid #00ffff',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%)',
        padding: '25px',
        boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'
      });

      let itemsHTML = section.items.map(item => `
        <div style="margin-bottom: 15px; padding: 12px; background: rgba(0, 40, 40, 0.5); border-left: 3px solid #00cccc;">
          <div style="color: #00cccc; font-size: 0.9em; margin-bottom: 5px; text-transform: uppercase;">${item.label}</div>
          <div style="color: #00ffff; font-size: 1.1em; font-weight: bold;">${item.value}</div>
        </div>
      `).join('');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #00ffff;">
          <h2 style="font-family: 'Orbitron', monospace; font-size: 1.5em; color: #00ffff; text-transform: uppercase;">${section.title}</h2>
          <span style="font-family: 'Orbitron', monospace; padding: 8px 15px; background: rgba(0, 100, 0, 0.8); color: #00ff00; border: 1px solid #00ff00; border-radius: 3px; font-size: 0.9em; text-transform: uppercase;">${section.status}</span>
        </div>
        ${itemsHTML}
      `;

      grid.appendChild(card);
    });

    return grid;
  }

  function clear() {
    root.innerHTML = '';
    currentContent = null;
  }

  function showError(message) {
    clear();
    
    const errorBox = createElement('div', {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(50, 0, 0, 0.95)',
      border: '2px solid #ff0000',
      padding: '30px',
      textAlign: 'center',
      boxShadow: '0 0 30px rgba(255, 0, 0, 0.8)'
    });

    errorBox.innerHTML = `
      <h2 style="font-family: 'Orbitron', monospace; color: #ff0000; margin-bottom: 15px; text-transform: uppercase;">ERROR</h2>
      <p style="color: #ffcccc;">${message}</p>
    `;

    root.appendChild(errorBox);
  }

  return { renderHUD, clear, showError };
}
