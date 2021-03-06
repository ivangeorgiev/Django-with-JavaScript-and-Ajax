---
typora-copy-images-to: media
typora-root-url: .
---



# Chapter 1. Introduction

## Visual Studio Code

Install Django extension from Baptiste Darthenay 

`Ctrl+Shift+P` -> Open Workspace Settings, select User tab and disable *Text Editor* -> *Formatting* -> *Format On Save*



# Chapter 3. CRUD App Project

## 3.1. Creating Virtualenv and Setting Up the Django Project

```bash
# Create Python virtual environment
$ py -m venv .venv
$ source .venv/Scripts/activate

# Install django
$ pip install django
....
Installing collected packages: sqlparse, pytz, asgiref, django
Successfully installed asgiref-3.4.1 django-3.2.5 pytz-2021.1 sqlparse-0.4.1

# Create Django project
$ django-admin startproject posts_project
$ mv posts_project src
$ cd src

# Create SQLite database
$ python manage.py migrate

# Create superuser
$ python manage.py createsuperuser
Username: sa
Email address:
Password: sa

# Create Django applications
$ python manage.py startapp posts
$ python manage.py startapp profiles

# Start the server
$ python manage.py runserver
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
July 10, 2021 - 06:56:12
Django version 3.2.5, using settings 'posts_project.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

Open in the browser `http://127.0.0.1:8000/`

![image-20210710065820721](/media/image-20210710065820721.png)

Login to the admin console `http://127.0.0.1:8000/admin`

![image-20210710070010312](/media/image-20210710070010312.png)



![image-20210710070038674](/media/image-20210710070038674.png)

## 3.2. Setting Up the Django Project - Continuation

```bash
$ pip install pillow

$ pip install django-crispy-forms

# Current directory is /src
$ pip freeze > ../requirements.txt

# Open VSCode from the root directory
$ code ..
```

Modify `/src/posts_project/settings.py`:

- add `posts` and `profiles` to installed apps
- add `crispy_forms` to installed apps

Create `/src/templates` directory

Add `BASE_DIR / 'templates'` to TEMPLATES.DIRS

Configure static files and media files

Create `/src/static` directory for project-wide static files. Add `style.css` file to static directory:

```css
.not-visible {
    display: none;
}
```

Create `/src/posts/static` and `/src/profiles/static` directories for application specific static files.

Create `src/media` for media files (user uploads).

Add

```python
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    BASE_DIR / 'posts' / 'static',
    BASE_DIR / 'profiles' / 'static',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

Update `posts_project/urls.py` to register media and static urls.

Create empty `/src/static/functions.js`

Create `/src/templates/base.html` (copy from the course repo) and `/src/templates/navbar.html`

## 3.3. Creating the Models

Create Profile class in `/src/profiles/models.py`

```python
from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  bio = models.TextField(blank=True)
  avatar = models.ImageField(default='avatar.png',upload_to='avatars')
  updated = models.DateTimeField(auto_now=True)
  created = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f'profile of the user {self.user.username}'
```

**Upload file** `avatar.png` to `/src/media`

Create Post class in `/src/posts/models.py`

```python
from django.db import models
from django.contrib.auth.models import User
from profiles.models import Profile

# Create your models here.
class Post(models.Model):
  title = models.CharField(max_length=200)
  body = models.TextField()
  liked = models.ManyToManyField(User, blank=True)
  author = models.ForeignKey(Profile, on_delete=models.CASCADE)
  updated = models.DateTimeField(auto_now=True)
  created = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f'{self.title}'
```

**Register the classes** in project's `admin.py`

`/src/posts/admin.py`

```python
from django.contrib import admin
from .models import Post

# Register your models here.
admin.site.register(Post)
```

`/src/profiles/admin.py`

```python
from django.contrib import admin
from .models import Profile

# Register your models here.
admin.site.register(Profile)
```

**Login / refresh Django admin console** to see the new models.

**Create a profile for the superuser** from admin.

## 3.4. Creating post_save Signal for Profile Creation

**Create file** `/src/profiles/signals.py`

```python
from .models import Profile
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def post_save_create_profile(sender, instance:User, created:bool, *args, **kwargs):
  if created:
    Profile.objects.create(user=instance)
```

Modify `/src/profiles/apps.py` to read the signals:

```python
from django.apps import AppConfig

class ProfilesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'profiles'

    def ready(self):
        import profiles.signals
```

Modify `/src/profiles/__init__.py` to define default app config

```python
default_app_config = 'profiles.apps.ProfilesConfig'
```

Go to django admin and create `test_user` verify profile got created.

## 3.5. Adding First View and Template

Create 6 posts in django admin:

- Title: Post N
- Body: Description of Post N
- Author: `<select>`

Create `posts/static/posts/main.js`:

```javascript
console.log('Hello world')
```



Create template `posts/templates/posts/main.html`:

```django
{% extends 'base.html' %}
{% load static %}

{% block title %}posts{% endblock title %}

{% block scripts %}
  {% comment %} defer attribute is important as it instructs the browser to postpone the execution of JS until page is loaded {% endcomment %}
  <script src="{% static 'posts/main.js' %}" defer></script>
{% endblock scripts %}

{% block content %}
  {% for obj in qs %}<b>{{ obj.title }}</b> - {{ obj.body }}</br>  {% endfor %}
  <div id="hello-world"></div>
{% endblock content %}
```



Create a view in `posts/views.py` which uses the `main.html` template:

```python
from django.shortcuts import render
from .models import Post

# Create your views here.
def post_list_and_create(request):
  qs = Post.objects.all()
  return render(request, 'posts/main.html', {'qs':qs})
```

Create `posts/urls.py`  to register urls:

```python
from django.urls import path
from .views import (
  post_list_and_create,
)

app_name = 'posts'

urlpatterns = [
  path('', post_list_and_create, name='main-board'),
]
```

Bring urls into the project's urls `/src/posts_project/urls.py`:

```python
urlpatterns += [path('', include('posts.urls', namespace='posts'))]
```

At this moment you  can open `http://localhost:8000/`

## 3.6. First DOM Manipulation

Modify `posts/templates/main.html`:

```django
{% block content %}
  {% for obj in qs %}<b>{{ obj.title }}</b> - {{ obj.body }}</br>  {% endfor %}
  <div id="hello-world"></div>
{% endblock content %}
```

Modify `posts/static/posts/main.js`:

```javascript
const helloBox = document.getElementById('hello-world')

helloBox.innerHTML = 'Hello me'
```

You could also update the text content:`helloBox.textContent = 'Hello me'`

## 3.7. First Ajax Call

Modify `posts/views.py`

```python
from django.http import JsonResponse

def hello_world_view(request):
  return JsonResponse({'text':'hello ajax'})
```

register the new view in `posts/views.py`:

```python
urlpatterns = [
  path('', post_list_and_create, name='main-board'),
  path('hello-world/', hello_world_view, name='hello-world'),
]
```

Open `http://localhost:8000/hello-world` to observe result.

Modify `posts/static/posts/main.js`:

```javascript
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
```

## 3.8. Getting Posts Objects with Ajax

### Dirty solution

`posts.views.py`

```python
from django.core import serializers

def load_post_data_view(request):
  qs = Post.objects.all()
  data = serializers.serialize('json', qs)
  return JsonResponse({'data':data})
```



### Better solution

Modify the Post model in `posts/models.py` adding `as_dict` method:

```python
  def as_dict(self):
    d = {
      'id': self.id,
      'title': self.title,
      'body': self.body,
      'author': {
        'username': self.author.user.username,
        # 'author_avatar': self.author.avatar
      }
    }
    return d
```



Modify `posts/views.py`:

```python
def load_post_data_view(request):
  qs = Post.objects.all()
  data = [o.as_dict() for o in qs]
  return JsonResponse({'data':data})
```

Register the view in `posts/urls.py`:

```python
urlpatterns = [
  path('', post_list_and_create, name='main-board'),
  path('api/posts/', load_post_data_view, name='posts-data'),
  path('hello-world/', hello_world_view, name='hello-world'),
]
```

Open `http://localhost:8000/api/posts/` to explore the results.



Modify `posts/templates/posts/main.html`:

```django
{% block content %}
  {% comment %} {% for obj in qs %}<b>{{ obj.title }}</b> - {{ obj.body }}</br>  {% endfor %} {% endcomment %}
  <div id="posts-box"></div?
  <div id="hello-world"></div>
{% endblock content %}
```

Modify (replace) `posts/static/posts/main.js`:

```javascript
console.log('Hello world')

const postBox = document.getElementById('posts-box')

$.ajax({
  type: 'GET',
  url: '/api/posts/',
  success: resp => {
    console.log(resp)
    postBox.innerHTML = ''
    resp.data.forEach( el => {
      // Backticks for multiline interpolated string.
      postBox.innerHTML += `
        <b>${el.title}</b> - ${el.body}<br />
      `
    })
  },
  error: err => {
    console.error(err)
  }
})
```

Navigate to `http://localhost:8000` to explore the result.

## 3.9. Adding the Spinner

Go to https://getbootstrap.com/ and navigate to [Docs](https://getbootstrap.com/docs/5.0/getting-started/introduction/).

In the `Search docs...` box search for *spinner*. Scroll down to the Border spinner and copy the HTML.

Add the spinner HTML to `posts/templates/posts/main.html`:

```django
{% block content %}
  {% comment %} {% for obj in qs %}<b>{{ obj.title }}</b> - {{ obj.body }}</br>  {% endfor %} {% endcomment %}
  <div class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  <div id="posts-box"></div>
{% endblock content %}
```

Modify `posts/static/posts/main.js`:

```javascript
const postBox = document.getElementById('posts-box')
const spinner = document.getElementById('spinner')

$.ajax({
  type: 'GET',
  url: '/api/posts/',
  success: resp => {
    console.log(resp)
    setTimeout(() => {
      spinner.classList.add('not-visible')
      postBox.innerHTML = ''
      resp.data.forEach( el => {
        postBox.innerHTML += `
          <b>${el.title}</b> - ${el.body}<br />
        `
      })
    }, 500)
  },
  error: err => {
    console.error(err)
  }
})
```

## 3.10. Creating Posts Cards

Go to https://getbootstrap.com/ and navigate to [Docs](https://getbootstrap.com/docs/5.0/getting-started/introduction/).

In the `Search docs...` box search for *cards*.  Copy the HTML for the first card example:

```html
<div class="card" style="width: 18rem;">
  <img src="..." class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
    <a href="#" class="btn btn-primary">Details...</a>
  </div>
</div>
```

Modify `posts/static/posts/main.js`:

```javascript
        postBox.innerHTML += `
          <div class="card mb-2">
          <!-- <img src="..." class="card-img-top" alt="..."> --!>
          <div class="card-body">
            <h5 class="card-title">${el.title}</h5>
            <p class="card-text">${el.body}</p>
            <a href="#" class="btn btn-primary">Details...</a>
          </div>
        </div>
        `
```

Adjust the spinner box in `posts/templates/posts/main.html` to have `text-center` class:

```django
  <div id="spinner" class="text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
```

## 3.11. Loading More Posts with a Button Click

Modify `posts/urls.py`:

```python
urlpatterns = [
  path('', post_list_and_create, name='main-board'),
  path('api/posts/<int:num_posts>/', load_post_data_view, name='posts-data'),
  path('hello-world/', hello_world_view, name='hello-world'),
]
```

Modify `posts/templates/posts/main.html`:

```django
{% block content %}
  {% comment %} {% for obj in qs %}<b>{{ obj.title }}</b> - {{ obj.body }}</br>  {% endfor %} {% endcomment %}
  <div id="posts-box"></div>
  <div id="spinner" class="text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div class="text-center mb-3" id="end-box">
     <button class="btn btn-primary" id="load-btn">Load more...</button>
  </div>
{% endblock content %}
```



Modify `posts/views.py`:

```python
def load_post_data_view(request, num_posts):
  def post_as_dict(post:Post):
    d = post.as_dict()
    d['liked'] = request.user in post.liked.all()
    return d
  visible = 3
  upper = num_posts
  lower = num_posts - visible
  size = Post.objects.all().count()

  qs = Post.objects.all()
  data = [post_as_dict(o) for o in qs]
  return JsonResponse({'data':data[lower:upper], 'size':size})
```

Modify `posts/static/posts/main.js`:

- wrap ajax in a function and adjust the ajax url

```javascript
const postBox = document.getElementById('posts-box')
const spinnerBox = document.getElementById('spinner')
const loadBtn = document.getElementById('load-btn')
const endBox = document.getElementById('end-box')

let visible = 3

const get_data = () => {
  endBox.classList.add('not-visible')
  $.ajax({
    type: 'GET',
    url: `/api/posts/${visible}/`,
    success: resp => {
      console.log(resp)
      // Give some time for the spinner to appear.
      setTimeout(() => {
        spinnerBox.classList.add('not-visible')
        // postBox.innerHTML = ''
        resp.data.forEach( el => {
          postBox.innerHTML += `
            <div class="card mb-2">
            <!-- <img src="..." class="card-img-top" alt="..."> --!>
            <div class="card-body">
              <h5 class="card-title">${el.title}</h5>
              <p class="card-text">${el.body}</p>
            </div>
            <div class="card-footer">
              <div class="row">
                <div class="col-2"><a href="#" class="btn btn-primary">Details...</a></div>
                <div class="col-2"><a href="#" class="btn btn-primary">Like</a></div>
              </div>
            </div>
          </div>
          `
        })
        if (resp.size == 0) {
          endBox.innerHTML = 'No posts added yet...'
        } else if (visible < resp.size) {
          endBox.classList.remove('not-visible')
        }
      }, 100)
    },
    error: err => {
      console.error(err)
    }
  })
}

loadBtn.addEventListener('click', () => {
  spinnerBox.classList.remove('not-visible')
  visible += 3
  get_data()
})

get_data()

```

