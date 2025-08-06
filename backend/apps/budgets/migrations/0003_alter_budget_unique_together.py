# Generated manually to update Budget unique constraint

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('budgets', '0002_budget_workspace'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='budget',
            unique_together={('workspace', 'user', 'nome', 'mes', 'ano')},
        ),
    ]
