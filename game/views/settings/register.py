from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()

    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空"
        })
    if not password == password_confirm:
        return JsonResponse({
            'result': "两次输入的密码不一致"
        })

    if User.objects.filter(username = username).exists():
        return JsonResponse({
            'result': "用户名已被使用"
        })
    
    user = User(username = username)
    user.set_password(password)

    user.save()

    Player.objects.create(user=user, photo="https://app3152.acapp.acwing.com.cn/static/images/settings/acwing_logo.png")
    login(request, user)

    return JsonResponse({
        'result': "success",
    })
