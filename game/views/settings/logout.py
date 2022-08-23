from django.http import JsonResponse
from django.contrib.auth import logout as _logout

def logout(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': "success",
        })

    _logout(request)
    return JsonResponse({
        'result': "success",
    })
