# Generated manually to add new fields to Beneficiary model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beneficiaries', '0001_initial'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='beneficiary',
            name='unique_beneficiary_per_workspace',
        ),
        migrations.AddField(
            model_name='beneficiary',
            name='descricao',
            field=models.TextField(blank=True, help_text='Descrição adicional do beneficiário'),
        ),
        migrations.AddField(
            model_name='beneficiary',
            name='tipo',
            field=models.CharField(
                choices=[
                    ('CONTA_BANCARIA', 'Conta Bancária'),
                    ('CARTAO_CREDITO', 'Cartão de Crédito'),
                    ('FORNECEDOR', 'Fornecedor'),
                    ('CLIENTE', 'Cliente'),
                    ('FUNCIONARIO', 'Funcionário'),
                    ('SERVICO', 'Serviço'),
                    ('OUTRO', 'Outro')
                ],
                default='OUTRO',
                help_text='Tipo do beneficiário para categorização',
                max_length=20
            ),
        ),
        migrations.AlterField(
            model_name='beneficiary',
            name='nome',
            field=models.CharField(max_length=150),
        ),
        migrations.AlterUniqueTogether(
            name='beneficiary',
            unique_together={('workspace', 'nome')},
        ),
        migrations.AddIndex(
            model_name='beneficiary',
            index=models.Index(fields=['workspace', 'is_active'], name='beneficiari_workspa_cfeacf_idx'),
        ),
        migrations.AddIndex(
            model_name='beneficiary',
            index=models.Index(fields=['user', 'is_active'], name='beneficiari_user_id_26cca1_idx'),
        ),
        migrations.AddIndex(
            model_name='beneficiary',
            index=models.Index(fields=['nome'], name='beneficiari_nome_d27ac5_idx'),
        ),
        migrations.AddIndex(
            model_name='beneficiary',
            index=models.Index(fields=['tipo'], name='beneficiari_tipo_8c7cb9_idx'),
        ),
    ]
