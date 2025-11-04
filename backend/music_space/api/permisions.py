from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAuthenticatedForWrite(BasePermission):
    """
    Permet GET, HEAD i OPTIONS a tothom.
    Requereix autenticació per POST, PUT, PATCH i DELETE.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True  # GET, HEAD, OPTIONS són públics
        return request.user and request.user.is_authenticated
