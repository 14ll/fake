(function () {
  if (document.getElementById('nukes-ui')) return;

  const unitIcons = {
    spear: '/graphic/unit_map/spear.png',
    sword: '/graphic/unit_map/sword.png',
    axe: '/graphic/unit_map/axe.png',
    spy: '/graphic/unit_map/spy.png',
    light: '/graphic/unit_map/light.png',
    ram: '/graphic/unit_map/ram.png',
    catapult: '/graphic/unit_map/catapult.png'
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
    #repeats {
      width: 100%; padding: 6px;
      font-size: 14px; margin-top: 10px;
      background: #1f1f2c; color: white;
      border: 1px solid #555; border-radius: 4px;
    }
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
            <label class="checkbox-label">Todas</label>
            <input type="checkbox" id="${unit}-all" title="Selecionar todas">
          </div>`).join('')}
      </div>
      <label>Coordenadas (separadas por espaço ou nova linha):</label>
      <textarea id="coords">500|500 501|501</textarea>
      <label>Intervalo entre ataques (ms):</label>
      <input type="number" id="tempo" value="500">
      <label>Repetições por coordenada:</label>
      <input type="number" id="repeats" value="1" min="1">
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
    const repeats = parseInt(document.getElementById('repeats').value) || 1;

    alert("Bot iniciado com " + coords.length + " coordenadas.");
    iniciarAtaques(tropas, coords, tempo, repeats);
  };

  function iniciarAtaques(tropas, coords, tempo, repeats) {
    let i = 0, r = 0;

    function enviarProxima() {
      if (i >= coords.length) {
        alert("Todos os ataques enviados.");
        return;
      }

      const [x, y] = coords[i].split('|');
      if (!x || !y) {
        i++; r = 0;
        setTimeout(enviarProxima, tempo);
        return;
      }

      document.forms[0].x.value = x;
      document.forms[0].y.value = y;

      let unidadesSuficientes = false;

      for (const [unit, value] of Object.entries(tropas)) {
        const input = document.forms[0][unit];
        if (!input) continue;

        if (value === -1) {
          const max = parseInt(input.parentElement.textContent.match(/\((\d+)\)/)?.[1] || 0);
          if (max > 0) {
            input.value = max;
            unidadesSuficientes = true;
          }
        } else {
          input.value = value;
          if (value > 0) unidadesSuficientes = true;
        }
      }

      if (!unidadesSuficientes) {
        i++; r = 0;
        setTimeout(enviarProxima, tempo);
        return;
      }

      const btn = document.forms[0].attack;
      if (btn) btn.click();

      r++;
      if (r >= repeats) {
        i++; r = 0;
      }

      setTimeout(enviarProxima, tempo);
    }

    enviarProxima();
  }
})();
