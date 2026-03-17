import { proxy, subscribe, unstable_enableOp } from 'valtio/vanilla'

unstable_enableOp(true)

export default function (initState, elements, i18next) {
    
    function formHandler(state) {
        const { form: { error, valid } } = state;
        const { input, formFeedback } = elements;
        
        if (valid) {
            input.classList.remove('is-invalid');
        } else {
            input.classList.add('is-invalid');
            formFeedback.classList.add('text-danger');
            formFeedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);
        }
    }
    
    function loadingProcessHandler(state) {
        const { loadingProcess } = state
        const { input, formFeedback } = state

        switch (loadingProcess.status) {
            case 'failed':
                input.removeAttribute('readonly');
                formFeedback.classList.add('text-danger');
                formFeedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);
                break
            case 'idle':
                formFeedback.classList.add('text-success');
                formFeedback.textContent = i18next.t('loading.success');
                input.removeAttribute('readonly');
                input.value = '';
                input.focus()
                break
        }


    }
    
    
    
    
    
    const state = proxy(initState)

    subscribe(state, (changes) => {
        const handlers = {
            form: formHandler,
            loadingProcess: loadingProcessHandler,
        }
        changes.forEach(change => {
            const [, path] = change
            handlers[path](state)
        })
    })
    return state
}