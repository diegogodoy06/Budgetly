# Generated manually to update Transaction model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('beneficiaries', '0002_remove_beneficiary_unique_beneficiary_per_workspace_and_more'),
        ('transactions', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transaction',
            name='cost_center',
        ),
        migrations.AddField(
            model_name='transaction',
            name='beneficiario',
            field=models.ForeignKey(
                blank=True,
                help_text='Beneficiário da transação',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='transactions',
                to='beneficiaries.beneficiary'
            ),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='workspace',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='transactions',
                to='accounts.workspace'
            ),
        ),
    ]
