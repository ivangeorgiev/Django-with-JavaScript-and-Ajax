console.log('Hello world')

const postBox = document.getElementById('posts-box')

$.ajax({
  type: 'GET',
  url: '/api/posts/',
  success: resp => {
    console.log(resp)
    postBox.innerHTML = ''
    resp.data.forEach( el => {
      postBox.innerHTML += `
        <b>${el.title}</b> - ${el.body}<br />
      `
    })
  },
  error: err => {
    console.error(err)
  }
})