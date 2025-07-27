from rest_framework import generics, permissions
from .models import Category, Tag
from .serializers import CategorySerializer, TagSerializer, CategoryWithTransactionCountSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user, is_active=True)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()


class CategoryStatsView(generics.ListAPIView):
    serializer_class = CategoryWithTransactionCountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user, is_active=True)


class TagListCreateView(generics.ListCreateAPIView):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)
