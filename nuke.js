(function () {
  if (document.getElementById('nukes-ui')) return;

  const style = `
    #nukes-ui {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #2c2f4a;
      border: 2px solid #555;
      border-radius: 10px;
      padding: 20px;
      z-index: 9999;
      width: 450px;
      font-family: Arial, sans-serif;
      color: #fff;
      box-shadow: 0 0 15px rgba(0,0,0,0.6);
    }
    #nukes-ui h3 {
      margin-top: 0;
      text-align: center;
      color: #90caf9;
    }
    #nukes-ui label {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }
    .nukes-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .nukes-row input[type="number"], .nukes-row textarea {
      flex: 1;
      padding: 6px;
      border-radius: 5px;
      border: none;
      font-size: 14px;
    }
    .nukes-row input[type="checkbox"] {
      transform: scale(1.2);
    }
    textarea {
      width: 100%;
      resize: vertical;
    }
    #start-bot {
      width: 100%;
      padding: 10px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: bold;
      cursor: pointer;
    }
    #nukes-close {
      position: absolute;
      top: 10px;
      right: 15px;
      color: #ff5252;
      font-weight: bold;
      cursor: pointer;
    }
  `;

  const unitRows = [
    { label: "Lanceiros (sp)", name: "spear", id: "sp" },
    { label: "Espadas (sw)", name: "sword", id: "sw" },
    { label: "Machados (ax)", name: "axe", id: "ax" },
    { label: "Batedores (scout)", name: "spy", id: "scout" },
    { label: "Cavalaria leve", name: "light", id: "light" },
    { label: "Arietes", name: "ram", id: "ram" },
    { label: "Catapultas (cat)", name: "catapult", id: "cat" },
  ];

  const html = `
    <div id="nukes-ui">
      <div id="nukes-close">X</div>
      <h3>Nukes</h3>
      ${unitRows.map(u => `
        <label>${u.label}</label>
        <div class="nukes-row">
          <input type="number" id="${u.id}" value="0">
          <label><input type="checkbox" id="${u.id}_all"> Todas</label>
        </div>
      `).join('')}

      <label>Coordenadas (uma por linha):</label>
      <textarea id="coords" rows="4">495|548\n500|581</textarea>

      <label>Tempo entre ataques (ms):</label>
      <input type="number" id="tempo" value="500">

      <button id="start-bot">Iniciar</button>
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
    const tempo = parseInt(document.getElementById('tempo').value);
    const coordsRaw = document.getElementById('coords').value;
    const coords = coordsRaw.split('\n').map(c => c.trim()).filter(c => c);

    const unidades = {};
    unitRows.forEach(({ name, id }) => {
      const usarTodas = document.getElementById(id + '_all').checked;
      const inputValor = parseInt(document.getElementById(id).value);
      const campo = document.getElementsByName(name)[0];
      const max = parseInt(campo?.getAttribute('data-all') || campo?.value || 0);
      unidades[name] = usarTodas ? max : inputValor;
    });

    alert("Bot iniciado com " + coords.length + " coordenadas.");
    iniciarAtaques(unidades, coords, tempo);
  };

  function iniciarAtaques(unidades, coords, tempo) {
    let i = 0;

    function enviarProxima() {
      if (i >= coords.length) {
        alert("Todos os ataques enviados.");
        return;
      }

      const [x, y] = coords[i].split('|');
      if (!x || !y) {
        i++;
        setTimeout(enviarProxima, tempo);
        return;
      }

      document.getElementsByName('x')[0].value = x;
      document.getElementsByName('y')[0].value = y;

      for (let nome in unidades) {
        const campo = document.getElementsByName(nome)[0];
        if (campo) campo.value = unidades[nome];
      }

      const botao = document.querySelector("input[type='submit']");
      if (botao) botao.click();

      i++;
      setTimeout(enviarProxima, tempo);
    }

    enviarProxima();
  }
})();
