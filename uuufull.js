(function () {
    'use strict';

    const STORAGE_KEY = 'nukes_sender_state';

    function saveState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    function loadState() {
        const s = localStorage.getItem(STORAGE_KEY);
        if (!s) return null;
        try { return JSON.parse(s); } catch { return null; }
    }
    function clearState() {
        localStorage.removeItem(STORAGE_KEY);
    }

    if (window.location.href.includes('place_confirm')) {
        setTimeout(() => {
            const confirmBtn = document.querySelector('input[type="submit"], button[type="submit"]');
            if (confirmBtn) confirmBtn.click();
        }, 500);
        return;
    }

    const savedState = loadState();
    if (window.location.href.includes('screen=place') && savedState) {
        const form = document.forms[0];
        if (!form) {
            alert('Formulário não encontrado. Abortando.');
            clearState();
            return;
        }

        if (savedState.currentCoordIndex >= savedState.coords.length) {
            alert('Todos os ataques enviados.');
            clearState();
            return;
        }

        const coord = savedState.coords[savedState.currentCoordIndex].split('|');
        if (coord.length !== 2) {
            alert('Coordenada inválida. Abortando.');
            clearState();
            return;
        }
        form.x.value = coord[0];
        form.y.value = coord[1];

        let totalUnits = 0;
        Object.entries(savedState.units).forEach(([unit, qty]) => {
            if (form[unit]) {
                form[unit].value = qty;
                totalUnits += qty;
            }
        });

        if (totalUnits === 0) {
            savedState.currentCoordIndex++;
            savedState.currentRepeatIndex = 0;
            saveState(savedState);
            window.location.reload();
            return;
        }

        savedState.currentRepeatIndex++;
        if (savedState.currentRepeatIndex >= savedState.repeatCount) {
            savedState.currentCoordIndex++;
            savedState.currentRepeatIndex = 0;
        }
        saveState(savedState);
        form.submit();
        return;
    }

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
    content.style = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:#f2f2f2;border:2px solid #888;padding:10px;z-index:9999;font-size:12px;font-family:sans-serif;border-radius:10px;width:auto;max-width:90%;max-height:90vh;overflow:auto;';

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
        checkbox.title = 'Usar quantidade total disponível';

        const labelTodas = document.createElement('div');
        labelTodas.textContent = 'Todas';
        labelTodas.style = 'font-size:10px;margin-top:2px;';

        wrapper.appendChild(img);
        wrapper.appendChild(input);
        wrapper.appendChild(checkbox);
        wrapper.appendChild(labelTodas);

        unitLine.appendChild(wrapper);

        unitInputs[unit] = { input, checkbox };
    });

    const coordInput = document.createElement('textarea');
    coordInput.placeholder = 'Ex: 587|385 586|386 586|385';
    coordInput.rows = 3;
    coordInput.style = 'width:100%;margin-bottom:10px;resize:vertical;';

    const repeatLabel = document.createElement('label');
    repeatLabel.textContent = 'Nº de ataques por coordenada: ';
    repeatLabel.style = 'display:flex;align-items:center;margin-bottom:10px;';

    const repeatInput = document.createElement('input');
    repeatInput.type = 'number';
    repeatInput.min = '1';
    repeatInput.value = '1';
    repeatInput.style = 'width:50px;margin-left:5px;';

    repeatLabel.appendChild(repeatInput);

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Enviar';
    sendBtn.style = 'padding:6px 12px;font-weight:bold;margin-top:5px;cursor:pointer;';

    const info = document.createElement('div');
    info.innerHTML = '<br><div>Created by Rath</div><div>Modified by ChatGPT</div>';

    function getTotalUnits(unit) {
        const el = document.getElementById(`units_entry_all_${unit}`);
        if (el) return parseInt(el.textContent) || 0;

        const row = document.querySelector(`tr.units > td.${unit}`);
        if (row) {
            const val = parseInt(row.textContent.replace(/\D/g, ''));
            if (!isNaN(val)) return val;
        }
        return 0;
    }

    sendBtn.onclick = () => {
        const coordsRaw = coordInput.value.trim();
        if (!coordsRaw) {
            alert('Por favor, insira as coordenadas.');
            return;
        }
        const coords = coordsRaw.split(/\s+/);
        const repeatCount = parseInt(repeatInput.value);
        if (isNaN(repeatCount) || repeatCount < 1) {
            alert('Número de ataques inválido.');
            return;
        }

        const unitsQuant = {};
        let totalUnits = 0;
        for (const [unit] of units) {
            const useAll = unitInputs[unit].checkbox.checked;
            let qty = 0;
            if (useAll) {
                qty = getTotalUnits(unit);
            } else {
                qty = parseInt(unitInputs[unit].input.value) || 0;
            }
            unitsQuant[unit] = qty;
            totalUnits += qty;
        }
        if (totalUnits === 0) {
            alert('Informe ao menos uma unidade para enviar.');
            return;
        }

        const state = {
            coords,
            repeatCount,
            currentCoordIndex: 0,
            currentRepeatIndex: 0,
            units: unitsQuant
        };

        saveState(state);
        alert('Iniciando envio automático. A página será recarregada.');
        window.location.reload();
    };

    content.appendChild(unitLine);
    content.appendChild(coordInput);
    content.appendChild(repeatLabel);
    content.appendChild(sendBtn);
    content.appendChild(info);

    document.body.appendChild(content);
})();
