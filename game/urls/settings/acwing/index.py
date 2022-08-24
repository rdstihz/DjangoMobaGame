from django.urls import path
from game.views.settings.acwing.web.acwing_login import apply_code, receive_code


urlpatterns = [
    path('web/apply_code/', apply_code, name="settings_acwing_web_apply_code"),
    path('web/receive_code/', receive_code, name="settins_acwing_web_receive_code")
]

