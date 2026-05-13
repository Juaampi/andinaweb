const demoRevealNodes = document.querySelectorAll('.demo-reveal');

if (demoRevealNodes.length) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.14,
    });

    demoRevealNodes.forEach((node, index) => {
        node.style.opacity = '0';
        node.style.transform = 'translateY(18px)';
        node.style.transition = `opacity 520ms ease ${Math.min(index * 40, 180)}ms, transform 520ms ease ${Math.min(index * 40, 180)}ms`;
        revealObserver.observe(node);
    });

    requestAnimationFrame(() => {
        demoRevealNodes.forEach((node) => {
            node.addEventListener('transitionend', () => {
                if (node.classList.contains('is-visible')) {
                    node.style.transform = 'none';
                }
            }, { once: true });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.demo-reveal.is-visible').forEach((node) => {
        node.style.opacity = '1';
        node.style.transform = 'none';
    });
});

const demoAssistantDefaultConfig = {
    businessName: 'Andina Demo',
    assistantName: 'Andina Assistant',
    assistantTag: 'Recorrido guiado de ejemplo',
    directActionLabel: 'Hablar por WhatsApp',
    directActionHref: 'https://wa.me/5492944324419?text=Hola%2C%20quiero%20ver%20una%20demo%20de%20asistente%20virtual.',
    summaryLabel: 'Resumen demo',
    finalButtonLabel: 'Ver propuesta sugerida',
    finalButtonHref: 'https://wa.me/5492944324419?text=Hola%2C%20quiero%20una%20demo%20como%20esta%20para%20mi%20negocio.',
    themeIcon: '',
    flow: [],
};

function initDemoAssistants() {
    const roots = document.querySelectorAll('[data-demo-assistant]');

    roots.forEach((root) => {
        const config = {
            ...demoAssistantDefaultConfig,
            ...JSON.parse(root.querySelector('script[type="application/json"]').textContent),
        };

        const messages = root.querySelector('[data-demo-messages]');
        const actions = root.querySelector('[data-demo-actions]');
        const form = root.querySelector('[data-demo-form]');
        const input = root.querySelector('[data-demo-input]');
        const directLink = root.querySelector('[data-demo-direct]');

        if (directLink) {
            directLink.textContent = config.directActionLabel;
            directLink.href = config.directActionHref;
        }

        const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

        const state = {
            step: 0,
            answers: {},
        };

        const optionLabelMap = new Map();

        const getOptions = (step) => {
            if (!step) {
                return [];
            }

            if (typeof step.options === 'function') {
                return step.options(state.answers);
            }

            return step.options || [];
        };

        config.flow.forEach((step) => {
            (step.options || []).forEach((option) => optionLabelMap.set(option.value, option.label));
        });

        const scrollBottom = () => {
            messages.scrollTop = messages.scrollHeight;
        };

        const addMessage = (role, html) => {
            const wrapper = document.createElement('div');
            wrapper.className = `demo-msg ${role}`;
            wrapper.innerHTML = `<div class="demo-bubble">${html}</div>`;
            messages.appendChild(wrapper);
            scrollBottom();
            return wrapper;
        };

        const typing = async () => {
            const node = addMessage('bot', '<div class="demo-typing" aria-label="escribiendo"><span></span><span></span><span></span></div>');
            await sleep(420);
            node.remove();
        };

        const humanize = (value) => optionLabelMap.get(value) ?? value;

        const renderActions = (nodes) => {
            actions.innerHTML = '';
            nodes.forEach((node) => actions.appendChild(node));
        };

        const finish = async () => {
            await typing();

            const summary = document.createElement('div');
            summary.className = 'demo-summary';
            summary.innerHTML = `
                <strong>${config.summaryLabel}</strong>
                <div class="demo-summary-grid">
                    ${config.flow.map((step) => `
                        <div>
                            <span>${step.shortLabel || step.label}</span>
                            <strong>${state.answers[step.key] ? humanize(state.answers[step.key]) : 'A definir'}</strong>
                        </div>
                    `).join('')}
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.appendChild(summary);
            addMessage('bot', wrapper.innerHTML);

            const finalLink = document.createElement('a');
            finalLink.className = 'demo-button demo-button-primary';
            finalLink.href = config.finalButtonHref;
            finalLink.target = '_blank';
            finalLink.rel = 'noreferrer';
            finalLink.textContent = config.finalButtonLabel;

            const restartButton = document.createElement('button');
            restartButton.type = 'button';
            restartButton.className = 'demo-button demo-button-secondary';
            restartButton.textContent = 'Reiniciar demo';
            restartButton.addEventListener('click', () => {
                state.step = 0;
                state.answers = {};
                messages.innerHTML = '';
                actions.innerHTML = '';
                start();
            });

            renderActions([finalLink, restartButton]);
        };

        const ask = async () => {
            const step = config.flow[state.step];

            if (!step) {
                await finish();
                return;
            }

            await typing();

            if (step.type === 'text') {
                addMessage('bot', `<div>${step.question}</div>`);
                input.placeholder = step.placeholder || 'Escribí tu respuesta...';

                const skip = document.createElement('button');
                skip.type = 'button';
                skip.className = 'demo-button demo-button-secondary';
                skip.textContent = 'Omitir';
                skip.addEventListener('click', async () => {
                    renderActions([]);
                    state.answers[step.key] = 'Sin detalle extra';
                    addMessage('user', 'Sin detalle extra');
                    state.step += 1;
                    await ask();
                });

                renderActions([skip]);
                return;
            }

            const options = getOptions(step);
            options.forEach((option) => optionLabelMap.set(option.value, option.label));

            addMessage(
                'bot',
                `<div>${step.question}</div><div class="demo-options">${options.map((option) => `<button type="button" class="demo-chip" data-option="${option.value}">${option.label}</button>`).join('')}</div>`
            );

            input.placeholder = 'Podés escribir un detalle o tocar una opción...';

            const chips = Array.from(messages.querySelectorAll('.demo-chip')).slice(-options.length);
            chips.forEach((chip) => {
                chip.addEventListener('click', async () => {
                    chips.forEach((item) => {
                        item.disabled = true;
                        item.classList.remove('is-selected');
                    });

                    chip.classList.add('is-selected');

                    const value = chip.dataset.option;
                    state.answers[step.key] = value;
                    addMessage('user', humanize(value));
                    state.step += 1;
                    renderActions([]);
                    await ask();
                }, { once: true });
            });
        };

        const start = () => {
            input.placeholder = 'Podés escribir un detalle o tocar una opción...';
            ask();
        };

        form?.addEventListener('submit', async (event) => {
            event.preventDefault();

            const value = input.value.trim();
            const step = config.flow[state.step];

            if (!value || !step) {
                return;
            }

            state.answers[step.key] = value;
            addMessage('user', value);
            input.value = '';
            state.step += 1;
            renderActions([]);
            await ask();
        });

        start();
    });
}

initDemoAssistants();

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.demo-reveal').forEach((node) => {
        if (node.classList.contains('is-visible')) {
            return;
        }

        const observer = new MutationObserver(() => {
            if (node.classList.contains('is-visible')) {
                node.style.opacity = '1';
                node.style.transform = 'none';
                observer.disconnect();
            }
        });

        observer.observe(node, { attributes: true, attributeFilter: ['class'] });
    });
});
