"""
Exception handlers para workspace
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError


def workspace_exception_handler(exc, context):
    """
    Handler customizado para exceptions de workspace
    """
    # Chamar o handler padrão primeiro
    response = exception_handler(exc, context)

    # Se é uma exception de workspace, customizar a resposta
    if isinstance(exc, ValidationError):
        return Response(
            {'detail': str(exc)},
            status=status.HTTP_400_BAD_REQUEST
        )

    return response
