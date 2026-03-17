import {setLocale, string} from 'yup'
import i18next from 'i18next'
import axios from 'axios'

import resources from './locales/index.js'
import locale from './locales/locale.js'
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
  console.log(1)
  const urlWithProxy = addProxy(url)
  axios.get(urlWithProxy)
    .then(resp => {
      const data = parse(resp.data.contents)
      

      // state.feeds.push()
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
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts')
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
