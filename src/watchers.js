import { proxy, subscribe, unstable_enableOp } from 'valtio/vanilla'

unstable_enableOp(true)

function getElementsByClasses(container, elementsClasses) {
  return elementsClasses.reduce((elements, elClass) => {
    elements.push(container.querySelector(`.${elClass}`))
    return elements
  }, [])
}

function feedItem() {
  const el = document.createElement('li')
  el.classList.add('feed', 'list-group-item', 'border-0', 'border-end-0')
  el.innerHTML = `<h3 class="feedTitle h6 m-0"></h3>
<p class="feedDescr m-0 small text-black-50"></p>`
  return el
}

function postItem() {
  const el = document.createElement('li')
  el.classList.add('post', 'list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0')
  el.innerHTML = `<a href="" class="postLink"></a>
<button type="button" class="postView btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal"></button>`
  return el
}

export default function (initState, elements, i18next) {
  function formHandler(state) {
    const { form: { error, valid } } = state
    const { input, formFeedback } = elements

    if (valid) {
      input.classList.remove('is-invalid')
    }
    else {
      input.classList.add('is-invalid')
      formFeedback.classList.add('text-danger')
      formFeedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown'])
    }
  }

  function loadingProcessHandler(state) {
    const { loadingProcess: { status, error } } = state
    const { submit, input, formFeedback } = elements
    if (!state.form.valid) return
    switch (status) {
      case 'failed':
        submit.disabled = false
        formFeedback.classList.add('text-danger')
        formFeedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown'])
        input.removeAttribute('readonly')

        break
      case 'idle':
        submit.disabled = false
        formFeedback.classList.add('text-success')
        formFeedback.textContent = i18next.t('loading.success')
        input.removeAttribute('readonly')
        input.value = ''
        input.focus()

        break
      case 'loading':
        submit.disabled = true
        input.readOnly = true
        formFeedback.classList.remove('text-success')
        formFeedback.classList.remove('text-danger')
        formFeedback.textContent = ''

        break
    }
  }

  function feedsHandler(state) {
    const { feeds } = state
    const { feedsBox, templates: { feeds: { box } } } = elements
    if (feeds.length === 0) return

    const fBox = box.content.cloneNode(true)
    const [feedsTitle, feedsList] = getElementsByClasses(fBox, ['feedsTitle', 'feedsList'])

    feedsTitle.textContent = i18next.t('feeds')
    const reversedFeeds = feeds.reverse()
    const feedsItems = reversedFeeds.map((feed) => {
      const { title, description } = feed

      const element = feedItem()
      const [feedTitle, feedDescr] = getElementsByClasses(element, ['feedTitle', 'feedDescr'])

      feedTitle.textContent = title
      feedDescr.textContent = description

      return element
    })
    feedsList.append(...feedsItems)

    feedsBox.innerHTML = ''
    feedsBox.append(fBox)
  }

  function postsHandler(state) {
    const { posts, modal, ui } = state
    const { postsBox, templates: { posts: { box } } } = elements
    postsBox.innerHTML = ''

    if (posts.length === 0) return
    const pBox = box.content.cloneNode(true)
    const [postsTitle, postsList] = getElementsByClasses(pBox, ['postsTitle', 'postsList'])

    postsTitle.textContent = i18next.t('posts')
    const postsItems = posts.map((post) => {
      const { id, title, link } = post

      const element = postItem()
      const [postLink, postView] = getElementsByClasses(element, ['postLink', 'postView'])

      const classes = ui.seenPosts.has(id) ? ['fw-normal', 'link-secondary'] : ['fw-bold']
      postLink.classList.add(...classes)
      postLink.textContent = title
      postLink.href = link
      postLink.dataset.id = id

      postView.textContent = i18next.t('view')
      postView.dataset.id = id
      postView.dataset.bsToggle = 'modal'
      postView.dataset.bsTarget = '#modal'
      postView.addEventListener('click', () => {
        modal.postId = id
        ui.seenPosts.add(id)
      })

      return element
    })
    postsList.append(...postsItems)

    postsBox.append(pBox)
  }

  function modalHandler(state) {
    const { posts, modal: { postId } } = state
    const { modal } = elements
    if (!postId) return
    const { title, description, link } = posts.find(post => post.id === postId)

    const [modalTitle, modalBody, modalFullBtn] = getElementsByClasses(modal, ['modal-title', 'modal-body', 'full-article'])

    modalTitle.textContent = title
    modalBody.textContent = description
    modalFullBtn.href = link
  }

  const state = proxy(initState)

  subscribe(state, () => {
    const handlers = [formHandler, loadingProcessHandler, feedsHandler, postsHandler, modalHandler]
    handlers.forEach(handler => handler(state))
  })
  return state
}
