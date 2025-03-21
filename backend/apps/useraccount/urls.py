# from django.urls import path
# from .views import UserAccountListCreateView, UserAccountRetrieveUpdateDestroyView, CustomTokenObtainPairView

# urlpatterns = [
#     path('account/', UserAccountListCreateView.as_view(), name="user-account"),
#     path('account/<int:pk>/', UserAccountRetrieveUpdateDestroyView.as_view(), name="one-user"),
#     path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
# ]

from django.urls import path
from .views import UserCreateView, AdminUserCreateView

urlpatterns = [
    # Regular user registration
    path('register/', UserCreateView.as_view(), name='user-create'),
    # Admin-only endpoint to create superusers
    path('admin/register/', AdminUserCreateView.as_view(), name='adminuser-create'),
]