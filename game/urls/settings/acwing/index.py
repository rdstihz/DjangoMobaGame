from django.urls import path
from game.views.settings.acwing.web.acwing_login import apply_code as web_apply_code, receive_code as web_receive_code
from game.views.settings.acwing.acapp.acwing_login import apply_code as acapp_apply_code, receive_code as acapp_receive_code

urlpatterns = [
    path('web/apply_code/', web_apply_code, name="settings_acwing_web_apply_code"),
    path('web/receive_code/', web_receive_code, name="settins_acwing_web_receive_code"),
    path('acapp/apply_code/', acapp_apply_code, name="settings_acwing_acapp_apply_code"),
    path('acapp/receive_code/', acapp_receive_code, name="settins_acwing_acapp_receive_code")
]

