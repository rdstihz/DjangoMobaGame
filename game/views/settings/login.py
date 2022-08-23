from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.contrib.auth import login as _login

def login(request):
    data = request.GET;

    username = data.get("username")
    password = data.get("password")
    user = authenticate(username = username, password = password)

    if not user:
        return JsonResponse({
            'result': "用户名或密码不正确",
        })

    _login(request, user)
    return JsonResponse({
        'result': "success",
    })

