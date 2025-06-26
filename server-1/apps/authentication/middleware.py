from django.utils.deprecation import MiddlewareMixin

class AccountMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if hasattr(request, 'user'):
            request.account = request.user