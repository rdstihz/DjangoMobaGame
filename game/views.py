from django.http import HttpResponse
# Create your views here.


def index(request):
    content = '''
        <h1 style="text-align: center">主菜单</h1>
        <a href="/play/">进入游戏页面</a>
    '''
    return HttpResponse(content)

def play(request):
    content = '''
        <h1 style="text-align: center">游戏界面</h1>
        <a href="/">返回主菜单</a>
    '''
    return HttpResponse(content)

