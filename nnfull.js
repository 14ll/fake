(function () {
    'use strict';

    if (window.location.href.includes('place_confirm')) {
        const confirmBtn = document.querySelector('input[type="submit"], button[type="submit"]');
        if (confirmBtn) confirmBtn.click();
        return;
    }

    if (document.getElementById('nukes-interface')) return;

    const units = [
        ['spear', 'Lança'],
        ['sword', 'Espada'],
        ['axe', 'Machado'],
        ['archer', 'Arqueiro'],
        ['spy', 'Batedor'],
        ['light', 'Cav. Leve'],
        ['marcher', 'Arq. Cavalo'],
        ['heavy', 'Cav. Pesada'],
        ['ram', 'Ariete'],
        ['catapult', 'Catapulta']
    ];

    const content = document.createElement('div');
    content.id = 'nukes-interface';
    content.style = `
        position:fixed;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%);
        background:#f2f2f2;
        border:2px solid #888;
        padding:10px;
        z-index:9999;
        font-size:12px;
        font-family:sans-serif;
        border-radius:10px;
        width:auto;
        max-width:90%;
        max-height:90vh;
        overflow:auto;
    `;

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
        checkbox.title = 'Usar todas';

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

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar';
    closeBtn.style = 'padding:6px 12px;font-weight:bold;margin-top:5px;margin-left:10px;cursor:pointer;';
    closeBtn.onclick = () => content.remove();

    const info = document.createElement('div');
    info.innerHTML = '<br><div>Created by Rath</div>';

    function getTotalUnits(unit) {
        const cell = document.querySelector(`#units_home td[class*="unit-item"][data-unit="${unit}"]`);
        if (cell) {
            return parseInt(cell.textContent.trim()) || 0;
        }
        const alt = document.querySelector(`input[name="${unit}"]`)?.closest('tr')?.querySelector('td[class*="unit"]');
        return alt ? parseInt(alt.textContent.trim()) || 0 : 0;
    }

    function setFieldValue(input, value) {
        input.value = value;
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
    }

    sendBtn.onclick = () => {
        const coords = coordInput.value.trim().split(/\s+/);
        const repeat = parseInt(repeatInput.value) || 1;

        if (!coords.length || coords[0] === '') {
            alert('Insira pelo menos uma coordenada.');
            return;
        }

        let currentCoord = 0;
        let rep = 0;

        function enviarAtaque() {
            if (currentCoord >= coords.length) {
                alert('Todos os ataques foram enviados.');
                return;
            }

            const [x, y] = coords[currentCoord].split('|');
            const form = document.forms[0];

            if (!form || !form.x || !form.y) {
                alert('Formulário inválido.');
                return;
            }

            form.x.value = x;
            form.y.value = y;

            let total = 0;
            units.forEach(([unit]) => {
                const { input, checkbox } = unitInputs[unit];
                let qty = 0;
                if (checkbox.checked) {
                    qty = getTotalUnits(unit);
                } else {
                    qty = parseInt(input.value) || 0;
                }

                if (form[unit]) {
                    setFieldValue(form[unit], qty);
                    total += qty;
                }
            });

            if (total === 0) {
                console.log(`Aldeia ${x}|${y} sem tropas suficientes. Saltando.`);
                currentCoord++;
                rep = 0;
                setTimeout(enviarAtaque, 300);
                return;
            }

            rep++;
            if (rep >= repeat) {
                currentCoord++;
                rep = 0;
            }

            form.submit();
        }

        enviarAtaque();
    };

    content.appendChild(unitLine);
    content.appendChild(coordInput);
    content.appendChild(repeatLabel);
    content.appendChild(sendBtn);
    content.appendChild(closeBtn);
    content.appendChild(info);
    document.body.appendChild(content);
})();
