// ==UserScript==
// @name         Nukes Sender UI
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Interface para envio automático de ataques com unidades personalizadas
// @author       Rath
// @match        *screen=place*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (window.location.href.includes('place_confirm')) {
        const confirmBtn = document.querySelector('input[type="submit"], button[type="submit"]');
        if (confirmBtn) confirmBtn.click();
        return;
    }

    // Interface já existe?
    if (document.getElementById('nukes-interface')) return;

    const units = [
        ['spear', 'Lança'],
        ['sword', 'Espada'],
        ['axe', 'Machado'],
        ['archer', 'Arqueiro'],
        ['spy', 'Batedor'],
        ['light', 'Cavalaria Leve'],
        ['marcher', 'Arqueiro a Cavalo'],
        ['heavy', 'Cavalaria Pesada'],
        ['ram', 'Aríete'],
        ['catapult', 'Catapulta']
    ];

    const content = document.createElement('div');
    content.id = 'nukes-interface';
    content.style = 'position:fixed;top:10px;left:10px;background:#f2f2f2;border:2px solid #888;padding:10px;z-index:9999;font-size:12px;font-family:sans-serif;border-radius:10px;width:auto;max-width:90%;overflow:auto;';

    const unitLine = document.createElement('div');
    unitLine.style = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;align-items:flex-end;';

    const unitInputs = {};

    units.forEach(([unit, label]) => {
        const wrapper = document.createElement('div');
        wrapper.style = 'display:flex;flex-direction:column;align-items:center;';

        const img = document.createElement('img');
        img.src = `/graphic/unit_map/${unit}.png`;
        img.alt = label;
        img.style = 'width:24px;height:24px;margin-bottom:2px;';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.maxLength = '8';
        input.style = 'width:55px;margin-bottom:2px;text-align:center;';
        input.placeholder = '0';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        const labelTodas = document.createElement('div');
        labelTodas.textContent = 'Todas';
        labelTodas.style = 'font-size:10px;margin-top:2px;';

        unitInputs[unit] = { input, checkbox };

        wrapper.appendChild(img);
        wrapper.appendChild(input);
        wrapper.appendChild(checkbox);
        wrapper.appendChild(labelTodas);
        unitLine.appendChild(wrapper);
    });

    const coordInput = document.createElement('textarea');
    coordInput.placeholder = 'Ex: 587|385 586|386 586|385';
    coordInput.rows = 3;
    coordInput.style = 'width:100%;margin-bottom:10px;resize:vertical;';

    const repeatLabel = document.createElement('label');
    repeatLabel.textContent = 'Nº de ataques por coordenada: ';
    const repeatInput = document.createElement('input');
    repeatInput.type = 'number';
    repeatInput.min = '1';
    repeatInput.value = '1';
    repeatInput.style = 'width:50px;margin-left:5px;margin-bottom:10px;';

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Enviar';
    sendBtn.style = 'padding:6px 12px;font-weight:bold;margin-top:5px;';

    const info = document.createElement('div');
    info.innerHTML = '<br><div>Created by Rath</div><div>Modified by ChatGPT</div>';

    sendBtn.onclick = () => {
        const coords = coordInput.value.trim().split(/\s+/);
        const ataquesPorCoord = parseInt(repeatInput.value) || 1;

        let index = 0;

        function enviarProximo() {
            if (index >= coords.length) {
                alert('Ataques enviados.');
                return;
            }

            const coord = coords[index].split('|');
            const form = document.forms[0];
            if (!form) return;

            form.x.value = coord[0];
            form.y.value = coord[1];

            // Limpar campos
            units.forEach(([unit]) => {
                const val = unitInputs[unit].checkbox.checked
                    ? parseInt(document.getElementById(`units_entry_all_${unit}`)?.textContent) || 0
                    : parseInt(unitInputs[unit].input.value) || 0;

                if (form[unit]) form[unit].value = val;
            });

            // Verifica se há tropas suficientes (se zero em todos, salta)
            const total = units.reduce((acc, [unit]) => {
                return acc + (parseInt(form[unit]?.value) || 0);
            }, 0);

            if (total === 0) {
                index++;
                enviarProximo();
                return;
            }

            // Enviar ataque
            form.submit();
        }

        // Enviar múltiplos por coordenada
        function repetirAtaques() {
            let rep = 0;

            function enviarRep() {
                if (rep < ataquesPorCoord) {
                    enviarProximo();
                    rep++;
                    setTimeout(enviarRep, 1000);
                } else {
                    index++;
                    rep = 0;
                    if (index < coords.length) setTimeout(repetirAtaques, 1000);
                }
            }

            enviarRep();
        }

        repetirAtaques();
    };

    content.appendChild(unitLine);
    content.appendChild(coordInput);
    content.appendChild(repeatLabel);
    repeatLabel.appendChild(repeatInput);
    content.appendChild(sendBtn);
    content.appendChild(info);

    document.body.appendChild(content);
})();
