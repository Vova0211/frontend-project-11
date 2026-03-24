import { setLocale, string } from 'yup'
import i18next from 'i18next'
import axios from 'axios'

import resources from './locales/index.js'
import locale from './locales/locale.js'
import { v4 as uuidv4 } from 'uuid';
import watcher from './watchers.js'
import parse from './rss.js'

function validateUrl(url, feeds) {
  setLocale(locale)

  const feedsUrl = feeds.map(feed => feed.url)
  const schema = string().url().required().notOneOf(feedsUrl)
  return schema.validate(url)
    .then(() => null)
    .catch(e => e.message)
}

function addProxy(url) {
  const urlWithProxy = new URL(`https://allorigins.hexlet.app/get`) 
  urlWithProxy.searchParams.set('disableCache', true)
  urlWithProxy.searchParams.set('url', url)
  return urlWithProxy.toString()
}

function getLoadProcessError(error) {
  if (error.isParsingError) {
    return 'noRSS';
  }
  if (error.isAxiosError) {
    return 'network';
  }
  return 'unknown';
}

function loadRSS(state, url) {
  const urlWithProxy = addProxy(url)
  axios.get(urlWithProxy)
    .then(resp => {
      const { feedDesc, items } = parse(resp.data.contents)
      const feed = { url, id: uuidv4(), ...feedDesc }
      state.feeds.push(feed)
      state.posts.push(...items)

      state.loadingProcess = {
        ...state.loadingProcess,
        status: 'idle',
        error: null,
      }
    })
    .catch(e => {
      state.loadingProcess = {
        ...state.loadingProcess,
        status: 'failed',
        error: getLoadProcessError(e)
      }
    })
}



export default function () {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    formFeedback: document.querySelector('.feedback'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
    submit: document.querySelector('button[type="submit"]'),
    templates: {
      posts: {
        box: document.getElementById('postsBox'),
        item: document.getElementById('postItem')
      },
      feeds: {
        box: document.getElementById('feedsBox'),
        item: document.getElementById('feedItem')
      },
    },
  }
  const initState = {
    feeds: [],
    posts: [],
    form: {
      valid: false,
      error: null
    },
    loadingProcess: {
      status: 'idle',
      error: null
    }
  }

  const i18nextInstance = i18next.createInstance();
  const promise = i18nextInstance.init({
    lng: 'ru',
    resources,
  })
  .then(() => {
    const state = watcher(initState, elements, i18nextInstance)
    elements.form.addEventListener('submit', event => {
      event.preventDefault()
      const data = new FormData(event.target);
      const url = data.get('url');
      state.loadingProcess.status = 'loading'

      validateUrl(url, state.feeds)
       .then(err => {
          if (err) {            
            state.form = {
              ...state.form,
              valid: false,
              error: err
            }
          } else {
            state.form = {
              ...state.form,
              valid: true,
              error: null
            }
            loadRSS(state, url)
          }
       })
    })    
  })

  return promise
}
