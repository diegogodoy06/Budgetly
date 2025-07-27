import django_filters
from .models import Transaction, TransactionType


class TransactionFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    transaction_type = django_filters.ChoiceFilter(choices=TransactionType.choices)
    account = django_filters.NumberFilter(field_name='account__id')
    category = django_filters.NumberFilter(field_name='category__id')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    description = django_filters.CharFilter(field_name='description', lookup_expr='icontains')

    class Meta:
        model = Transaction
        fields = ['start_date', 'end_date', 'transaction_type', 'account', 'category', 
                 'amount_min', 'amount_max', 'description']
