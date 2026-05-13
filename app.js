const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
});

revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
    observer.observe(element);
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initChatDemo = () => {
    const stage = document.querySelector('[data-chat-stage]');

    if (!stage) {
        return;
    }

    const scenes = Array.from(stage.querySelectorAll('[data-chat-scene]'));

    if (!scenes.length) {
        return;
    }

    const getSceneLines = (scene) => Array.from(scene.querySelectorAll('[data-chat-line]'));

    const resetScene = (scene) => {
        getSceneLines(scene).forEach((line) => line.classList.remove('is-visible'));
        scene.classList.remove('is-active');
    };

    const scrollStageToLine = async (line, behavior = 'smooth') => {
        const target = Math.max(0, line.offsetTop + line.offsetHeight - stage.clientHeight + 26);
        stage.scrollTo({ top: target, behavior });
        await sleep(320);
    };

    const sceneDelay = (line) => {
        if (line.classList.contains('chat-typing-live')) {
            return 950;
        }

        if (line.classList.contains('chat-scroll-demo') || line.classList.contains('chat-catalog-row')) {
            return 1300;
        }

        if (line.classList.contains('chat-message-success')) {
            return 1800;
        }

        if (line.classList.contains('chat-message-bot')) {
            return 1400;
        }

        if (line.classList.contains('chat-message-user')) {
            return 980;
        }

        return 850;
    };

    const play = async () => {
        while (true) {
            for (const scene of scenes) {
                scenes.forEach((item) => resetScene(item));
                stage.scrollTo({ top: 0, behavior: 'auto' });
                scene.classList.add('is-active');
                await sleep(240);

                const lines = getSceneLines(scene);

                for (const line of lines) {
                    line.classList.add('is-visible');
                    await scrollStageToLine(line, line.classList.contains('chat-scene-tag') ? 'auto' : 'smooth');
                    await sleep(sceneDelay(line));

                    if (line.classList.contains('chat-typing-live')) {
                        line.classList.remove('is-visible');
                        await scrollStageToLine(line, 'smooth');
                        await sleep(130);
                    }
                }

                await sleep(1800);
            }
        }
    };

    play();
};

initChatDemo();

const widgetFlow = [
    {
        key: 'business',
        label: 'Tipo de negocio',
        question: 'Hola. Te ayudo a definir que tipo de web te conviene. Para empezar, ¿que tipo de negocio tenes?',
        options: [
            { value: 'servicios', label: 'Servicios o profesional' },
            { value: 'restaurant', label: 'Restaurante o cafe' },
            { value: 'hotel', label: 'Hotel o turismo' },
            { value: 'store', label: 'Tienda o marca' },
            { value: 'salud', label: 'Salud o bienestar' },
            { value: 'other', label: 'Otro proyecto' },
        ],
    },
    {
        key: 'goal',
        label: 'Objetivo principal',
        question: 'Perfecto. ¿Que necesitas que haga mejor la web?',
        options: [
            { value: 'consultas', label: 'Recibir consultas' },
            { value: 'ventas', label: 'Vender productos' },
            { value: 'reservas', label: 'Tomar turnos o reservas' },
            { value: 'presencia', label: 'Mostrar mejor la marca' },
            { value: 'orden', label: 'Ordenar atencion y procesos' },
        ],
    },
    {
        key: 'type',
        label: 'Tipo de web',
        question: 'Con eso en mente, ¿que formato sentis que va mejor?',
        options: (answers) => getWidgetTypeOptions(answers),
    },
    {
        key: 'features',
        label: 'Funcionalidad destacada',
        question: '¿Que te gustaria sumar en esa web?',
        options: (answers) => getWidgetFeatureOptions(answers),
    },
    {
        key: 'style',
        label: 'Estilo visual',
        question: '¿Que personalidad visual te imaginas?',
        options: [
            { value: 'tech', label: 'Tecnologica' },
            { value: 'premium', label: 'Premium' },
            { value: 'warm', label: 'Calida' },
            { value: 'minimal', label: 'Minimalista' },
            { value: 'regional', label: 'Regional o aventurera' },
        ],
    },
    {
        key: 'details',
        label: 'Detalles extra',
        question: 'Ultimo paso: si queres, contame el nombre del negocio o algun detalle importante y te preparo el WhatsApp.',
        type: 'text',
        placeholder: 'Ejemplo: Necesito destacar menu, reservas y una imagen mas premium. El negocio se llama...',
    },
];

function getWidgetTypeOptions(answers) {
    const options = [];
    const add = (value, label) => {
        if (!options.some((option) => option.value === value)) {
            options.push({ value, label });
        }
    };

    if (answers.goal === 'ventas') {
        add('ecommerce', 'Ecommerce');
        add('catalogo', 'Catalogo con WhatsApp');
    }

    if (answers.goal === 'reservas' || answers.business === 'restaurant' || answers.business === 'hotel') {
        add('reservas', 'Web con reservas');
    }

    add('landing', 'Landing comercial');
    add('institucional', 'Web institucional');
    add('catalogo', 'Catalogo con WhatsApp');

    return options;
}

function getWidgetFeatureOptions(answers) {
    const map = {
        landing: [
            { value: 'whatsapp', label: 'Boton a WhatsApp' },
            { value: 'formulario', label: 'Formulario de contacto' },
            { value: 'faq', label: 'Preguntas frecuentes' },
            { value: 'testimonios', label: 'Testimonios' },
        ],
        institucional: [
            { value: 'secciones', label: 'Varias secciones o paginas' },
            { value: 'galeria', label: 'Galeria' },
            { value: 'mapa', label: 'Mapa y ubicacion' },
            { value: 'blog', label: 'Novedades o blog' },
        ],
        ecommerce: [
            { value: 'carrito', label: 'Carrito de compra' },
            { value: 'pagos', label: 'Medios de pago' },
            { value: 'stock', label: 'Stock y variantes' },
            { value: 'envios', label: 'Envios o retiro' },
        ],
        catalogo: [
            { value: 'galeria', label: 'Catalogo visual' },
            { value: 'filtros', label: 'Filtros o categorias' },
            { value: 'whatsapp', label: 'Consulta por WhatsApp' },
            { value: 'destacados', label: 'Promos o destacados' },
        ],
        reservas: [
            { value: 'agenda', label: 'Agenda o calendario' },
            { value: 'confirmaciones', label: 'Confirmaciones automaticas' },
            { value: 'recordatorios', label: 'Recordatorios por WhatsApp' },
            { value: 'asistente', label: 'Asistente guiado' },
        ],
    };

    return map[answers.type] ?? map.landing;
}

function initFloatingAssistant() {
    const root = document.getElementById('webandina-assistant');

    if (!root) {
        return;
    }

    const panel = document.getElementById('webandina-assistant-panel');
    const launcher = document.getElementById('webandina-assistant-launcher');
    const hint = document.getElementById('webandina-assistant-hint');
    const launcherWrap = root.querySelector('.webandina-assistant-launcher-wrap');
    const messages = document.getElementById('webandina-assistant-messages');
    const actions = document.getElementById('webandina-assistant-actions');
    const inputForm = document.getElementById('webandina-assistant-input-form');
    const input = document.getElementById('webandina-assistant-input');
    const openButtons = root.querySelectorAll('[data-webandina-open]');
    const closeButton = root.querySelector('[data-webandina-close]');

    const state = {
        open: false,
        step: 0,
        answers: {},
    };

    const optionLabels = new Map();
    widgetFlow.forEach((step) => {
        if (Array.isArray(step.options)) {
            step.options.forEach((option) => optionLabels.set(option.value, option.label));
        }
    });

    const scrollBottom = () => {
        messages.scrollTop = messages.scrollHeight;
    };

    const buildMessage = () => {
        const label = (value) => optionLabels.get(value) ?? value;
        return [
            'Hola, quiero solicitar una propuesta para una web.',
            '',
            'Datos relevados por el asistente:',
            `- Tipo de negocio: ${state.answers.business ? label(state.answers.business) : 'A definir'}`,
            `- Objetivo principal: ${state.answers.goal ? label(state.answers.goal) : 'A definir'}`,
            `- Tipo de web: ${state.answers.type ? label(state.answers.type) : 'A definir'}`,
            `- Funcionalidad destacada: ${state.answers.features ? label(state.answers.features) : 'A definir'}`,
            `- Estilo visual: ${state.answers.style ? label(state.answers.style) : 'A definir'}`,
            `- Detalles extra: ${state.answers.details || 'Sin detalles adicionales'}`,
            '',
            'Quisiera recibir una propuesta recomendada para este caso. Gracias.',
        ].join('\n');
    };

    const addMessage = (role, html) => {
        const wrapper = document.createElement('div');
        wrapper.className = `webandina-msg ${role}`;
        wrapper.innerHTML = `<div class="webandina-bubble">${html}</div>`;
        messages.appendChild(wrapper);
        scrollBottom();
        return wrapper;
    };

    const typing = async () => {
        const bubble = addMessage('bot', '<div class="webandina-typing" aria-label="WebAndina esta escribiendo"><span></span><span></span><span></span></div>');
        await sleep(420);
        bubble.remove();
    };

    const answerLabel = (value) => optionLabels.get(value) ?? value;

    const buildUserReply = (_step, value) => value;

    const submitTypedAnswer = async (rawValue) => {
        const value = rawValue.trim();

        if (!value || state.step >= widgetFlow.length) {
            return;
        }

        const step = widgetFlow[state.step];
        state.answers[step.key] = value;
        addMessage('user', buildUserReply(step, value));
        input.value = '';
        state.step += 1;
        await askStep();
    };

    const renderActions = (nodes) => {
        actions.innerHTML = '';
        nodes.forEach((node) => actions.appendChild(node));
    };

    const finishFlow = async () => {
        await typing();
        const label = (value) => optionLabels.get(value) ?? value;
        addMessage('bot', `
            <div>Perfecto. Antes de enviarte la propuesta, te dejo el resumen para confirmar.</div>
            <div class="webandina-summary-card">
                <strong>Resumen del proyecto</strong>
                <p>Con esto ya puedo preparar el mensaje final para WhatsApp.</p>
                <div class="webandina-summary-list">
                    <div><span>Negocio</span><strong>${state.answers.business ? label(state.answers.business) : 'A definir'}</strong></div>
                    <div><span>Objetivo</span><strong>${state.answers.goal ? label(state.answers.goal) : 'A definir'}</strong></div>
                    <div><span>Tipo de web</span><strong>${state.answers.type ? label(state.answers.type) : 'A definir'}</strong></div>
                    <div><span>Funcionalidad</span><strong>${state.answers.features ? label(state.answers.features) : 'A definir'}</strong></div>
                    <div><span>Estilo</span><strong>${state.answers.style ? label(state.answers.style) : 'A definir'}</strong></div>
                    <div><span>Detalles</span><strong>${state.answers.details || 'Sin detalles adicionales'}</strong></div>
                </div>
            </div>
        `);

        const send = document.createElement('a');
        send.className = 'webandina-action webandina-action-primary';
        send.href = `https://wa.me/5492944324419?text=${encodeURIComponent(buildMessage())}`;
        send.target = '_blank';
        send.rel = 'noreferrer';
        send.textContent = 'Enviar propuesta por WhatsApp';

        const restart = document.createElement('button');
        restart.type = 'button';
        restart.className = 'webandina-action';
        restart.textContent = 'Reiniciar';
        restart.addEventListener('click', () => {
            state.step = 0;
            state.answers = {};
            messages.innerHTML = '';
            actions.innerHTML = '';
            startFlow();
        });

        renderActions([send, restart]);
    };

    const askStep = async () => {
        if (state.step >= widgetFlow.length) {
            finishFlow();
            return;
        }

        const step = widgetFlow[state.step];
        input.placeholder = step.type === 'text'
            ? (step.placeholder || 'Escribi tu respuesta...')
            : 'Escribi tu idea o elegi una opcion...';
        await typing();

        if (step.type === 'text') {
            addMessage('bot', `<div>${step.question}</div>`);

            const skipButton = document.createElement('button');
            skipButton.type = 'button';
            skipButton.className = 'webandina-action';
            skipButton.textContent = 'Omitir';
            skipButton.addEventListener('click', async () => {
                renderActions([]);
                await submitTypedAnswer('Sin detalles adicionales');
            });

            renderActions([skipButton]);
            return;
        }

        const options = typeof step.options === 'function' ? step.options(state.answers) : step.options;
        options.forEach((option) => optionLabels.set(option.value, option.label));

        addMessage(
            'bot',
            `<div>${step.question}</div><div class="webandina-options">${options.map((option) => `<button type="button" class="webandina-chip" data-value="${option.value}">${option.label}</button>`).join('')}</div>`
        );

        const chips = Array.from(messages.querySelectorAll('.webandina-chip')).slice(-options.length);
        chips.forEach((chip) => {
            chip.addEventListener('click', async () => {
                const value = chip.dataset.value;
                const optionsWrap = chip.closest('.webandina-options');
                chips.forEach((item) => {
                    item.disabled = true;
                    item.classList.remove('is-selected');
                });
                chip.classList.add('is-selected');
                optionsWrap?.classList.add('is-exiting');
                await sleep(220);
                state.answers[step.key] = value;
                addMessage('user', buildUserReply(step, answerLabel(value)));
                input.value = '';
                state.step += 1;
                await askStep();
            }, { once: true });
        });
    };

    const startFlow = () => {
        input.placeholder = 'Escribi tu idea o elegi una opcion...';
        askStep();
    };

    const openPanel = () => {
        panel.hidden = false;
        root.classList.add('is-open');
        if (hint) {
            hint.hidden = true;
        }
        if (launcherWrap) {
            launcherWrap.hidden = true;
        } else {
            launcher.hidden = true;
        }
        state.open = true;

        if (!messages.children.length) {
            startFlow();
        }
    };

    const closePanel = () => {
        panel.hidden = true;
        root.classList.remove('is-open');
        if (hint) {
            hint.hidden = false;
        }
        if (launcherWrap) {
            launcherWrap.hidden = false;
        } else {
            launcher.hidden = false;
        }
        state.open = false;
    };

    openButtons.forEach((button) => button.addEventListener('click', openPanel));
    closeButton?.addEventListener('click', closePanel);
    inputForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        await submitTypedAnswer(input.value);
    });
}

initFloatingAssistant();
