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
  <script src="{% static 'posts/main.js' %}" defer></script>
{% endblock scripts %}

{% block content %}
  {% for obj in qs %}<b>{{ obj.title }}</b> - {{ obj.body }}</br>  {% endfor %}
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

