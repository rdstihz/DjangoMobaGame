from django.http import JsonResponse
from urllib.parse import quote
from django.core.cache import cache
from random import randint
import requests

from django.contrib.auth.models import User
from game.models.player.player import Player

def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    
    appid = "3279"
    redirect_uri = quote("https://rdstihz.top:444/settings/acwing/acapp/receive_code/")
    scope = "userinfo"
    state = get_state() # 随机识别字符串

    cache.set(state, True, 7200)

    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({
        'result': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })



def receive_code(request):
    data = request.GET
    
    if 'errcode' in data:
        return JsonResponse({
            'result': "error",
            'code': data.errcode,
            'message': data.errmsg
        })

    code = data.get('code') # 
    state = data.get('state')

    if not cache.has_key(state):
        return JsonResponse({
            'result': "state not exists"
        })
    cache.delete(state)

    #获取access token
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': "3279",
        'secret': "e20b1478784542e791eaf9be3aaf02f1",
        'code': code
    }
    resp = requests.get(apply_access_token_url, params).json()

    access_token = resp['access_token']
    openid = resp['openid']

    #如果用户已经注册过，则无需再次注册
    players = Player.objects.filter(openid = openid)
    if players.exists():
        #login(request, players[0].user) acapp 不需要login
        return JsonResponse({
            'result': "success",
            'username': players[0].user.username,
            'photo': players[0].photo
        })
    

    #获取用户名和头像信息
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'access_token': access_token,
        'openid': openid
    }
    resp = requests.get(get_userinfo_url, params).json()

    username = resp['username']
    photo = resp['photo']

    #如果用户名已存在，在用户名后加数字
    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))
    #注册用户
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)
    
    #登录并返回首页
    #login(request, user)
    return JsonResponse({
        'result': "success",
        'username': username,
        'photo': photo
    })

