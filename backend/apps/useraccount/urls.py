# from django.urls import path
# from .views import UserAccountListCreateView, UserAccountRetrieveUpdateDestroyView, CustomTokenObtainPairView

# urlpatterns = [
#     path('account/', UserAccountListCreateView.as_view(), name="user-account"),
#     path('account/<int:pk>/', UserAccountRetrieveUpdateDestroyView.as_view(), name="one-user"),
#     path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
# ]

from django.urls import path
from .views import SupabaseLoginView, UserDetailView

urlpatterns = [
    path('supabase-login/', SupabaseLoginView.as_view(), name='supabase-login'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
]