console.log('Hello world')

const helloBox = document.getElementById('hello-world')

helloBox.innerHTML = 'Hello me'

$.ajax({
  type: 'GET',
  url: '/hello-world/',
  success: resp => {
    console.log(resp)
    helloBox.textContent = resp.text
  },
  error: err => {
    console.error(err)
  }
})