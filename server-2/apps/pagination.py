from rest_framework.pagination import PageNumberPagination

class StandardResultsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
class ExportPagination(StandardResultsPagination):
    """Special pagination that can be disabled for exports"""
    def paginate_queryset(self, queryset, request, view=None):
        if request.query_params.get('export') == 'true':
            return None  # Disable pagination for exports
        return super().paginate_queryset(queryset, request, view)
    
    def get_paginated_response(self, data):
        if self.request.query_params.get('export') == 'true':
            return Response({
                'results': data,
                'count': len(data),
                'export': True  # Flag to indicate full export
            })
        return super().get_paginated_response(data)