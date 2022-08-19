from django.urls import path
from game.views import *

urlpatterns = [
    path('', index, name="index"),
    path('play/', play, name='play')
]
