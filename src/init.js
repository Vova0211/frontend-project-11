import { string, setLocale } from 'yup'

function validateUrl(url) {
    const schema = string().url().required()
    return schema.validate(url)
        .then(() => null)
        .catch(e => e.message)
}

export default function () {
    const elements = {
        form: document.querySelector('.rss-form'),
        formErrors: document.querySelector('.feedback'),
    }
    const state = {
        form: {
            valid: false,
        }
    }
}