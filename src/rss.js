export default function (data) {
  const parser = new DOMParser()
  const dom = parser.parseFromString(data, 'text/xml')
  
  const feedTitle = dom.querySelector('channel > title').textContent
  const feedDescr = dom.querySelector('channel > description').textContent

  const itemsElements = dom.querySelectorAll('channel > item')
  const items = [...itemsElements].map(item => {
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
    items
  }
}