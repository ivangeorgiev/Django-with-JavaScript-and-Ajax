from django.shortcuts import render
from django.http import JsonResponse
from .models import Post

# Create your views here.
def post_list_and_create(request):
  qs = Post.objects.all()
  return render(request, 'posts/main.html', {'qs':qs})

def load_post_data_view(request):
  qs = Post.objects.all()
  data = [o.as_dict() for o in qs]
  return JsonResponse({'data':data})

def hello_world_view(request):
  return JsonResponse({'text':'hello ajax'})
