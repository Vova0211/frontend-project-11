export default {
  mixed: {
    required: 'notEmpty',
    notOneOf: 'exists'
  },
  string: {
    url: 'notURL',
  },
}
