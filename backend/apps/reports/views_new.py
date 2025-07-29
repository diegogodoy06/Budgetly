from rest_framework import generics, permissions
from .models import Report, ImportHistory
from .serializers import ReportSerializer, ImportHistorySerializer


class ReportListCreateView(generics.ListCreateAPIView):
    """Lista e cria relatórios"""
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)


class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalhes, atualização e exclusão de relatório"""
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)


class ImportHistoryListView(generics.ListAPIView):
    """Lista histórico de importações"""
    serializer_class = ImportHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ImportHistory.objects.filter(user=self.request.user)
