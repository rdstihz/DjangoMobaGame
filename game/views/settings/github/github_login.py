from django.http import JsonResponse
from random import randint
from django.core.cache import cache
from urllib.parse import quote
from django.shortcuts import redirect
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
import requests


def get_state():
    res = ''
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    client_id = "59f2bfd0d795ef4cff19"
    redirect_uri = quote("https://rdstihz.top:444/settings/github/receive_code/")
    scope = "user"
    state = get_state()
    cache.set(state, True, 600)
    
    apply_code_url = "https://github.com/login/oauth/authorize" + \
        "?client_id=%s&redirect_uri=%s&scope=%s&state=%s" % (client_id, redirect_uri, scope, state)

    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url,
    })
def receive_code(request):
    data = request.GET
    print(request.GET)
    code = data.get("code")
    state = data.get("state")

    if not cache.has_key(state):
        return redirect('index')

    # 获取access_token
    apply_access_token_url = "https://github.com/login/oauth/access_token"
    client_id = "59f2bfd0d795ef4cff19"
    client_secret = "888e36bedc99ce638934e9a1429be1f100a38dac"

    params = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code
    }
    resp = requests.post(apply_access_token_url, params, headers = {'Accept': "application/json"}).json()
    print(resp)
    access_token = resp['access_token']

    # 使用token获取用户信息
    get_userinfo_url = "https://api.github.com/user"
    headers = {
        'Authorization': "token " + access_token,
        'Accept': "application/json"
    }
    resp = requests.get(get_userinfo_url, headers = headers).json()
    
    openid = resp['node_id']
    username = resp['login']
    photo = resp['avatar_url']
    
    #如果用户已经注册过，则无需再次注册
    players = Player.objects.filter(openid = openid)
    if players.exists():
        login(request, players[0].user)
        return redirect('index')

    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))
    #注册用户
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)
    #登录并返回首页
    login(request, user)
    return redirect('index')
