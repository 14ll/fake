// ==UserScript==
// @name         TW Interface com Ataque Direto
// @namespace    https://tribalwars.com/
// @version      1.0
// @description  Interface com ícones, seleção de tropas e envio automático
// @author       Rath
// @match        *://*.tribalwars.*/game.php*screen=place*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const unitTypes = ["spear", "sword", "axe", "archer", "spy", "light", "marcher", "heavy", "ram", "catapult"];
  const unitNames = {
    spear: "Lança",
    sword: "Espada",
    axe: "Machado",
    archer: "Arqueiro",
    spy: "Espião",
    light: "LC",
    marcher: "Arq. Cav.",
    heavy: "PC",
    ram: "Ariete",
    catapult: "Cata"
  };

  const style = document.createElement('style');
  style.innerHTML = `
    #tw-toolbox {
      background: #f4f4f4;
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid #999;
      border-radius: 8px;
      font-size: 12px;
    }
    #tw-toolbox table {
      width: 100%;
      text-align: center;
    }
    #tw-toolbox input[type='text'] {
      width: 60px;
      text-align: center;
    }
    #tw-toolbox img {
      width: 30px;
    }
    #tw-toolbox .coord-input {
      width: 100%;
      margin-top: 10px;
    }
    #tw-toolbox .footer {
      margin-top: 10px;
      font-size: 10px;
      text-align: center;
      color: #555;
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.id = "tw-toolbox";

  const table = document.createElement("table");
  let rowIcons = document.createElement("tr");
  let rowCheckboxLabels = document.createElement("tr");
  let rowInputs = document.createElement("tr");
  let rowCheckbox = document.createElement("tr");

  unitTypes.forEach(unit => {
    let iconCell = document.createElement("td");
    iconCell.innerHTML = `<img src="/graphic/unit/unit_${unit}.png">`;
    rowIcons.appendChild(iconCell);

    let labelCell = document.createElement("td");
    labelCell.innerHTML = `<b>Todas</b>`;
    rowCheckboxLabels.appendChild(labelCell);

    let inputCell = document.createElement("td");
    inputCell.innerHTML = `<input type='text' id='${unit}_input' maxlength='8'>`;
    rowInputs.appendChild(inputCell);

    let checkCell = document.createElement("td");
    checkCell.innerHTML = `<input type='checkbox' id='${unit}_checkbox'>`;
    rowCheckbox.appendChild(checkCell);
  });

  table.appendChild(rowIcons);
  table.appendChild(rowCheckboxLabels);
  table.appendChild(rowInputs);
  table.appendChild(rowCheckbox);
  container.appendChild(table);

  container.innerHTML += `
    <div style='margin-top:10px;'>
      <textarea id='coordenadas' rows='2' class='coord-input' placeholder='Insere coordenadas separadas por espaço (ex: 500|500 501|500)'></textarea>
    </div>
    <button id='btnEnviarAtaques'>Enviar</button>
    <div class='footer'>Created by Rath<br>Versão UI Landscape</div>
  `;

  const content = document.getElementById("content_value") || document.body;
  content.insertBefore(container, content.firstChild);

  document.getElementById("btnEnviarAtaques").addEventListener("click", () => iniciarAtaques());

  function iniciarAtaques() {
    const coordInput = document.getElementById('coordenadas');
    const coords = coordInput.value.trim().split(/\s+/);
    if (!coords.length) return alert("Insere pelo menos uma coordenada.");

    let currentCoordIndex = 0;

    function enviarProxima() {
      if (currentCoordIndex >= coords.length) {
        alert("Todos os ataques foram enviados. Próxima aldeia...");
        document.getElementById("village_switch_right").click();
        return;
      }

      const [x, y] = coords[currentCoordIndex].split("|");
      const form = document.forms[0];
      if (!form) return alert("Formulário de ataque não encontrado.");

      form.x.value = x;
      form.y.value = y;

      unitTypes.forEach(unit => {
        const checkbox = document.getElementById(`${unit}_checkbox`);
        const input = document.getElementById(`${unit}_input`);
        const available = parseInt(document.getElementById(`units_entry_all_${unit}`)?.innerText || "0");
        if (checkbox?.checked) {
          input.value = available;
        }
        form[unit].value = input.value || "";
      });

      const attackBtn = document.querySelector("input[type='submit'][name='attack']");
      if (attackBtn) {
        attackBtn.click();
        currentCoordIndex++;
        setTimeout(enviarProxima, 1000);
      } else {
        alert("Botão de ataque não encontrado.");
      }
    }

    enviarProxima();
  }
})();
