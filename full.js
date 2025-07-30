(function () {
  if (document.getElementById('nukes-ui')) return;

  const unitIcons = {
    spear: 'https://dspt.innogamescdn.com/8.215/37382/graphic/unit/unit_spear.png',
    sword: 'https://dspt.innogamescdn.com/8.215/37382/graphic/unit/unit_sword.png',
    axe: 'https://dspt.innogamescdn.com/8.215/37382/graphic/unit/unit_axe.png',
    spy: 'https://dspt.innogamescdn.com/8.215/37382/graphic/unit/unit_spy.png',
    light: 'https://dspt.innogamescdn.com/8.215/37382/graphic/unit/unit_light.png',
    ram: 'https://dspt.innogamescdn.com/8.215/37382/graphic/unit/unit_ram.png',
    catapult: 'https://dspt.innogamescdn.com/8.215/37382/graphic/unit/unit_catapult.png'
  };

  const style = `
    #nukes-ui {
      position: fixed; top: 40px; left: 50%; transform: translateX(-50%);
      background: #2c2c3b; color: #fff;
      padding: 20px; border-radius: 12px;
      z-index: 9999; font-family: sans-serif;
      box-shadow: 0 0 15px rgba(0,0,0,0.5);
      width: auto; min-width: 700px;
    }
    #nukes-ui h3 { margin-top: 0; margin-bottom: 16px; text-align: center; }
    #nukes-close {
      position: absolute; top: 8px; right: 12px;
      color: #ff6b6b; cursor: pointer; font-weight: bold;
    }
    .troop-grid {
      display: flex; gap: 12px; flex-wrap: wrap;
      justify-content: center; margin-bottom: 16px;
    }
    .troop-box {
      display: flex; flex-direction: column;
      align-items: center; background: #3c3c4a;
      padding: 8px; border-radius: 6px;
    }
    .troop-box img {
      width: 32px; height: 32px; margin-bottom: 4px;
    }
    .troop-box .checkbox-label {
      font-size: 11px; margin-top: 4px;
    }
    .troop-box input[type="number"] {
      width: 60px; padding: 4px;
      font-size: 13px; text-align: center;
      border: 1px solid #555; border-radius: 4px;
      margin-bottom: 4px;
    }
    .troop-box input[type="checkbox"] {
      margin-top: 2px;
    }
    #coords, #tempo {
      width: 100%; padding: 6px;
      border: 1px solid #555; border-radius: 4px;
      font-size: 14px; background: #1f1f2c; color: white;
    }
    #coords { height: 60px; margin-top: 10px; }
    #start-bot {
      margin-top: 12px; width: 100%; padding: 8px;
      background: #4CAF50; border: none; color: white;
      border-radius: 6px; font-size: 15px; cursor: pointer;
    }
    #credit {
      margin-top: 12px; text-align: center; font-size: 13px;
      color: #aaa;
    }
  `;

  const html = `
    <div id="nukes-ui">
      <div id="nukes-close">X</div>
      <h3>Nukes</h3>
      <div class="troop-grid">
        ${['spear','sword','axe','spy','light','ram','catapult'].map(unit => `
          <div class="troop-box">
            <img src="${unitIcons[unit]}" alt="${unit}">
            <input type="number" id="${unit}" value="0">
            <label class="checkbox-label">All</label>
            <input type="checkbox" id="${unit}-all" title="Selecionar todas">
          </div>`).join('')}
      </div>
      <label>Coordenadas (separadas por espaço ou nova linha):</label>
      <textarea id="coords"></textarea>
      <label>Intervalo entre ataques (ms):</label>
      <input type="number" id="tempo" value="500">
      <button id="start-bot">Iniciar</button>
      <div id="credit">Created by Rath</div>
    </div>
  `;

  const styleElem = document.createElement('style');
  styleElem.textContent = style;
  document.head.appendChild(styleElem);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  document.getElementById('nukes-close').onclick = () => {
    document.getElementById('nukes-ui').remove();
  };

  document.getElementById('start-bot').onclick = function () {
    const unidades = ['spear','sword','axe','spy','light','ram','catapult'];
    const tropas = {};
    unidades.forEach(unit => {
      const all = document.getElementById(`${unit}-all`).checked;
      tropas[unit] = all ? -1 : parseInt(document.getElementById(unit).value);
    });

    const coordsRaw = document.getElementById('coords').value;
    const coords = coordsRaw.split(/[\s\n]+/).map(c => c.trim()).filter(c => c);
    const tempo = parseInt(document.getElementById('tempo').value);

    // alert("Bot iniciado com " + coords.length + " coordenadas.");
    iniciarAtaques(tropas, coords, tempo);
  };

  function iniciarAtaques(tropas, coords, tempo) {
    let i = 0;
    function enviarProxima() {
      if (i >= coords.length) {
        alert("Todos os ataques enviados.");
        return;
      }
      const [x, y] = coords[i].split('|');
      if (!x || !y) return;

      document.getElementsByName('x')[0].value = x;
      document.getElementsByName('y')[0].value = y;

      for (const [unit, value] of Object.entries(tropas)) {
        const input = document.getElementsByName(unit)[0];
        if (input) input.value = value >= 0 ? value : input.max || 0;
      }

      const botao = document.querySelector("input[type='submit']");
      if (botao) botao.click();

      i++;
      setTimeout(enviarProxima, tempo);
    }
    enviarProxima();
  }
})();
