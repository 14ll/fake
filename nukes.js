(function () {
  if (document.getElementById('Nukes-ui')) return;

  const style = `
    #fakesbito-ui {
      position: fixed; top: 50px; right: 50px;
      background: #fff; border: 1px solid #ccc;
      padding: 15px; z-index: 9999; border-radius: 8px;
      width: 320px; font-family: sans-serif; box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }
    #fakesbito-ui input, #fakesbito-ui textarea {
      width: 100%; margin-bottom: 10px; padding: 6px;
      border: 1px solid #ccc; border-radius: 4px;
      font-size: 14px;
    }
    #fakesbito-ui button {
      padding: 8px 12px; background: #28a745; color: white;
      border: none; border-radius: 4px; cursor: pointer;
      width: 100%;
    }
    #fakesbito-ui h3 { margin-top: 0; }
    #fakesbito-close {
      position: absolute; top: 5px; right: 10px; cursor: pointer;
      color: red; font-weight: bold;
    }
  `;

  const html = `
    <div id="fakesbito-ui">
      <div id="fakesbito-close">X</div>
      <h3>Fakes Bito V5</h3>
      <label>Lanceiros (sp):</label>
      <input type="number" id="sp" value="0">
      <label>Espadas (sw):</label>
      <input type="number" id="sw" value="0">
      <label>Machados (ax):</label>
      <input type="number" id="ax" value="0">
      <label>Batedores (scout):</label>
      <input type="number" id="scout" value="1">
      <label>Catapultas (cat):</label>
      <input type="number" id="cat" value="13">
      <label>Coordenadas (uma por linha):</label>
      <textarea id="coords" rows="5">495|548\n500|581</textarea>
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

  document.getElementById('fakesbito-close').onclick = () => {
    document.getElementById('fakesbito-ui').remove();
  };

  document.getElementById('start-bot').onclick = function () {
    const sp = parseInt(document.getElementById('sp').value);
    const sw = parseInt(document.getElementById('sw').value);
    const ax = parseInt(document.getElementById('ax').value);
    const scout = parseInt(document.getElementById('scout').value);
    const cat = parseInt(document.getElementById('cat').value);
    const coordsRaw = document.getElementById('coords').value;
    const tempo = parseInt(document.getElementById('tempo').value);
    const coords = coordsRaw.split('\n').map(c => c.trim()).filter(c => c);

    alert("Bot iniciado com " + coords.length + " coordenadas.");
    iniciarAtaques(sp, sw, ax, scout, cat, coords, tempo);
  };

  function iniciarAtaques(sp, sw, ax, scout, cat, coords, tempo) {
    let i = 0;

    function enviarProxima() {
      if (i >= coords.length) {
        alert("Todos os ataques enviados.");
        return;
      }

      const coord = coords[i].split('|');
      const x = coord[0];
      const y = coord[1];

      console.log(`Enviando ataque para ${x}|${y}`);

      document.getElementsByName('x')[0].value = x;
      document.getElementsByName('y')[0].value = y;
      document.getElementsByName('spy')[0].value = scout;
      document.getElementsByName('catapult')[0].value = cat;
      document.getElementsByName('spear')[0].value = sp;
      document.getElementsByName('sword')[0].value = sw;
      document.getElementsByName('axe')[0].value = ax;

      const botao = document.querySelector("input[type='submit']");
      if (botao) botao.click();

      i++;
      setTimeout(enviarProxima, tempo);
    }

    enviarProxima();
  }
})();
