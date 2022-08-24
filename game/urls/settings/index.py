from django.urls import path, include
from game.views.settings.getinfo import getinfo
from game.views.settings.login import login
from game.views.settings.logout import logout
from game.views.settings.register import register

urlpatterns = [
    path('getinfo/', getinfo, name="setttings_getinfo"),
    path('login/', login, name="settings_login"),
    path('logout/', logout, name="settings_logout"),
    path('register/', register, name="settings_register"),
    path('acwing/', include("game.urls.settings.acwing.index"))
]
