from django.urls import path
from .views import SignInView, LoginView, UserAccountView

urlpatterns = [
    path('signup/', SignInView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/<int:pk>/', UserAccountView.as_view(), name='user-detail'),
    # # path('upload/', upload_image, name='user-image'),
]