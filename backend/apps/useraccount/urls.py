from django.urls import path
from .views import UserAccountListCreateView, UserAccountRetrieveUpdateDestroyView

urlpatterns = [
    path('signup/', UserAccountListCreateView.as_view(), name='signup'),
    path('login/', UserAccountRetrieveUpdateDestroyView.as_view(), name='login'),
]