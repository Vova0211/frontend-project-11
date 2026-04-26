export default function (data) {
  const parser = new DOMParser()
  const dom = parser.parseFromString(data, 'text/xml')

  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    error.data = data;
    throw error;
  }

  const feedTitle = dom.querySelector('channel > title').textContent
  const feedDescr = dom.querySelector('channel > description').textContent

  const itemsElements = dom.querySelectorAll('channel > item')
  const items = [...itemsElements].map((item) => {
    const title = item.querySelector('title').textContent
    const description = item.querySelector('description').textContent
    const link = item.querySelector('link').textContent
    return { title, description, link }
  })

  return {
    feed: {
      title: feedTitle,
      description: feedDescr,
    },
    items,
  }
}
