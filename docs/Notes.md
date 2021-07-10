---
typora-copy-images-to: media
typora-root-url: .
---



# Chapter 1. Introduction

## Visual Studio Code

Install Django extension from Baptiste Darthenay 

`Ctrl+Shift+P` -> Open Workspace Settings, select User tab and disable *Text Editor* -> *Formatting* -> *Format On Save*



# Chapter 3. CRUD App Project

## Creating Virtualenv and Setting Up the Django Project

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

