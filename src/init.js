import { setLocale, string } from 'yup'
import i18next from 'i18next'
import axios from 'axios'
import { differenceWith } from 'lodash'

import resources from './locales/index.js'
import locale from './locales/locale.js'
import { v4 as uuidv4 } from 'uuid'
import watcher from './watchers.js'
import parse from './rss.js'

const fetchingTimeout = 5000

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
    return 'noRSS'
  }
  if (error.isAxiosError) {
    return 'network'
  }
  return 'unknown'
}

function fetchNewPosts(state) {
  const { feeds, posts } = state
  const promises = feeds.map((feed) => {
    const url = addProxy(feed.url)
    return axios.get(url)
      .then((answer) => {
        const { items } = parse(answer.data.contents)
        const newPosts = items.map(post => ({ ...post, channelId: feed.id }))
        const oldPosts = posts.filter(post => post.channelId === feed.id)
        const filtredPosts = differenceWith(newPosts, oldPosts, (p1, p2) => p1.title === p2.title)
          .map(post => ({ ...post, id: uuidv4() }))

        posts.unshift(...filtredPosts)
      }).catch(error => error)
  })
  Promise.all(promises).finally(() => {
    setTimeout(() => fetchNewPosts(state), fetchingTimeout)
  })
}

function loadRSS(state, url) {
  state.loadingProcess.status = 'loading'
  const urlWithProxy = addProxy(url)

  axios.get(urlWithProxy)
    .then((resp) => {
      const { feed: feedDesc, items } = parse(resp.data.contents)
      const feed = { url, id: uuidv4(), ...feedDesc }
      const posts = items.map(post => ({ ...post, channelId: feed.id, id: uuidv4() }))
      state.feeds.push(feed)
      state.posts.unshift(...posts)

      state.loadingProcess = {
        ...state.loadingProcess,
        status: 'idle',
        error: null,
      }
    })
    .catch((e) => {
      state.loadingProcess = {
        ...state.loadingProcess,
        status: 'failed',
        error: getLoadProcessError(e),
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
        item: document.getElementById('postItem'),
      },
      feeds: {
        box: document.getElementById('feedsBox'),
        item: document.getElementById('feedItem'),
      },
    },
    modal: document.getElementById('modal'),
  }
  const initState = {
    feeds: [],
    posts: [],
    form: {
      valid: false,
      error: null,
    },
    loadingProcess: {
      status: '',
      error: null,
    },
    modal: {
      postId: null,
    },
    ui: {
      seenPosts: new Set(),
    },
  }

  const i18nextInstance = i18next.createInstance()
  const promise = i18nextInstance.init({
    lng: 'ru',
    resources,
  })
    .then(() => {
      const state = watcher(initState, elements, i18nextInstance)
      elements.form.addEventListener('submit', (event) => {
        event.preventDefault()
        const data = new FormData(event.target)
        const url = data.get('url').trim()

        validateUrl(url, state.feeds)
          .then((err) => {
            if (err) {
              state.form = {
                ...state.form,
                valid: false,
                error: err,
              }
            }
            else {
              state.form = {
                ...state.form,
                valid: true,
                error: null,
              }
              loadRSS(state, url)
            }
          })
      })
      setTimeout(() => fetchNewPosts(state), fetchingTimeout)
    })

  return promise
}
