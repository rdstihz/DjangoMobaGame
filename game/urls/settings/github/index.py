from django.urls import path
from game.views.settings.github.github_login import apply_code, receive_code


urlpatterns = [
    path('apply_code/', apply_code, name="settings_github_apply_code"),
    path('receive_code/', receive_code, name="settins_github_receive_code")
]

