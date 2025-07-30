(function(){
    'use strict';

    const STORAGE_KEY = 'nukes_sender_state';

    function isConfirmPage(){
        return window.location.href.includes('place_confirm') || window.location.href.includes('mode=confirm');
    }

    function isPlacePage(){
        return window.location.href.includes('screen=place') && !isConfirmPage();
    }

    function saveState(state){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    function loadState(){
        const s = localStorage.getItem(STORAGE_KEY);
        if(!s) return null;
        try{return JSON.parse(s);}catch{return null;}
    }
    function clearState(){
        localStorage.removeItem(STORAGE_KEY);
    }

    if(isConfirmPage()){
        console.log('[NukesSender] Página de confirmação detectada, tentando enviar...');
        setTimeout(()=>{
            const btn=document.querySelector('input[type=submit],button[type=submit]');
            if(btn){btn.click();console.log('[NukesSender] Confirmar clicado.');}
            else console.log('[NukesSender] Botão confirmar não encontrado.');
        },500);
        return;
    }

    if(!isPlacePage()){
        alert('NukesSender: Execute este bookmarklet apenas na página de envio de ataques.');
        return;
    }

    const units=[
        ['spear','Lança'],['sword','Espada'],['axe','Machado'],['archer','Arqueiro'],['spy','Batedor'],
        ['light','Cavalaria Leve'],['marcher','Arqueiro a Cavalo'],['heavy','Cavalaria Pesada'],['ram','Aríete'],['catapult','Catapulta']
    ];

    const savedState=loadState();

    if(savedState){
        // Envio automático
        const form=document.forms[0];
        if(!form){
            alert('NukesSender: Formulário não encontrado. Abortando.');
            clearState();
            return;
        }
        if(savedState.currentCoordIndex>=savedState.coords.length){
            alert('NukesSender: Todos os ataques enviados!');
            clearState();
            return;
        }

        const coordStr=savedState.coords[savedState.currentCoordIndex];
        const [x,y]=coordStr.split('|');
        if(!x||!y){
            alert('NukesSender: Coordenada inválida. Abortando.');
            clearState();
            return;
        }

        if(form.x)form.x.value=x;
        if(form.y)form.y.value=y;

        let totalUnits=0;
        for(const [unit,qty] of Object.entries(savedState.units)){
            if(form[unit]){
                form[unit].value=qty;
                totalUnits+=qty;
            }
        }

        if(totalUnits===0){
            savedState.currentCoordIndex++;
            savedState.currentRepeatIndex=0;
            saveState(savedState);
            window.location.reload();
            return;
        }

        console.log(`[NukesSender] Enviando ataque ${savedState.currentRepeatIndex+1} de ${savedState.ataquesPorCoord} para ${coordStr}`);

        savedState.currentRepeatIndex++;
        if(savedState.currentRepeatIndex>=savedState.ataquesPorCoord){
            savedState.currentCoordIndex++;
            savedState.currentRepeatIndex=0;
        }

        saveState(savedState);
        form.submit();
        return;
    }

    // Cria interface para início do envio

    if(document.getElementById('nukes-interface'))return;

    const content=document.createElement('div');
    content.id='nukes-interface';
    content.style='position:fixed;top:10px;left:10px;background:#f2f2f2;border:2px solid #888;padding:10px;z-index:9999;font-size:12px;font-family:sans-serif;border-radius:10px;width:auto;max-width:90%;overflow:auto;max-height:90vh;';

    const unitLine=document.createElement('div');
    unitLine.style='display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;align-items:flex-end;max-width:600px;';

    const unitInputs={};

    units.forEach(([unit,label])=>{
        const wrapper=document.createElement('div');
        wrapper.style='display:flex;flex-direction:column;align-items:center;';

        const img=document.createElement('img');
        img.src=`/graphic/unit_map/${unit}.png`;
        img.alt=label;
        img.style='width:24px;height:24px;margin-bottom:2px;';

        const input=document.createElement('input');
        input.type='number';
        input.min='0';
        input.maxLength='8';
        input.style='width:55px;margin-bottom:2px;text-align:center;';
        input.placeholder='0';

        wrapper.appendChild(img);
        wrapper.appendChild(input);
        unitLine.appendChild(wrapper);

        unitInputs[unit]=input;
    });

    const coordInput=document.createElement('textarea');
    coordInput.placeholder='Ex: 587|385 586|386 586|385';
    coordInput.rows=3;
    coordInput.style='width:100%;margin-bottom:10px;resize:vertical;';

    const repeatLabel=document.createElement('label');
    repeatLabel.textContent='Nº de ataques por coordenada: ';
    repeatLabel.style='display:flex;align-items:center;margin-bottom:10px;';
    const repeatInput=document.createElement('input');
    repeatInput.type='number';
    repeatInput.min='1';
    repeatInput.value='1';
    repeatInput.style='width:50px;margin-left:5px;';

    repeatLabel.appendChild(repeatInput);

    const sendBtn=document.createElement('button');
    sendBtn.textContent='Enviar';
    sendBtn.style='padding:6px 12px;font-weight:bold;margin-top:5px;cursor:pointer;';

    const info=document.createElement('div');
    info.innerHTML='<br><div>Created by Rath</div><div>Modified by ChatGPT</div>';

    sendBtn.onclick=()=>{
        const coordsRaw=coordInput.value.trim();
        if(!coordsRaw){
            alert('Insira as coordenadas!');
            return;
        }
        const coords=coordsRaw.split(/\s+/);
        const ataquesPorCoord=parseInt(repeatInput.value);
        if(isNaN(ataquesPorCoord)||ataquesPorCoord<1){
            alert('Número de ataques inválido!');
            return;
        }

        const unitsQuant={};
        let totalUnits=0;
        for(const [unit]of units){
            const val=parseInt(unitInputs[unit].value)||0;
            unitsQuant[unit]=val;
            totalUnits+=val;
        }
        if(totalUnits===0){
            alert('Informe ao menos uma unidade!');
            return;
        }

        const state={
            coords,
            ataquesPorCoord,
            currentCoordIndex:0,
            currentRepeatIndex:0,
            units:unitsQuant,
        };

        saveState(state);
        alert('Iniciando envio automático. Recarregando a página...');
        window.location.reload();
    };

    content.appendChild(unitLine);
    content.appendChild(coordInput);
    content.appendChild(repeatLabel);
    content.appendChild(sendBtn);
    content.appendChild(info);

    document.body.appendChild(content);

})();
