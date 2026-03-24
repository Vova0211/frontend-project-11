import { proxy, subscribe, unstable_enableOp, snapshot } from 'valtio/vanilla'

unstable_enableOp(true)

function getElementsByClasses(container, elementsClasses) {
    return elementsClasses.reduce((elements, elClass) => {
        elements[elClass] = container.querySelector(`.${elClass}`)
        return elements
    }, {})
}

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
        const { loadingProcess: { status, error } } = state
        const { submit, input, formFeedback } = elements

        switch (status) {
            case 'failed':
                submit.disabled = false
                formFeedback.classList.add('text-danger');
                formFeedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);
                input.removeAttribute('readonly');

                break
            case 'idle':
                submit.disabled = false
                formFeedback.classList.add('text-success');
                formFeedback.textContent = i18next.t('loading.success');
                input.removeAttribute('readonly');
                input.value = '';
                input.focus()

                break
            case 'loading':
                submit.disabled = true
                input.readOnly = true
                formFeedback.classList.remove('text-success');
                formFeedback.classList.remove('text-danger');
                formFeedback.textContent = '';

                break
        }
    }

    function feedsHandler(state) {
        const { feeds } = state;
        const { feedsBox, templates: { feeds: { box, item } } } = elements;
        if (feeds.length === 0) return; 
    
        const fBox = box.content.cloneNode(true)
        const { feedsTitle, feedsList } = getElementsByClasses(fBox, ['feedsTitle', 'feedsList'])
        
        feedsTitle.textContent = i18next.t('feeds');
        const feedsItems = feeds.map(feed => {
            const a = snapshot(feed)
            const { title, description } = feed

            const element = item.content.cloneNode(true)
            // const { feedTitle, feedDescr } = getElementsByClasses(element, ['feedTitle', 'feedDescr'])

            element.querySelector('.feedTitle').textContent = feed.title
            element.querySelector('.feedDescr').textContent = feed.description
            console.log(a);
            
            return element
        })
        feedsList.append(...feedsItems)

        feedsBox.innerHTML = ''
        feedsBox.append(fBox)
    }
    
    function postsHandler(state) {
        const { posts } = state
        const { postsBox, templates: { posts: box, item } } = elements


    }
    
    
    
    const state = proxy(initState)

    subscribe(state, (changes) => {
        const handlers = [formHandler, loadingProcessHandler, feedsHandler, postsHandler]
        handlers.forEach(handler => handler(state))
    })
    return state
}