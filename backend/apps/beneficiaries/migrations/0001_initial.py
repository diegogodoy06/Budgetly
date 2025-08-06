# Generated migration for beneficiaries app
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0003_add_user_profile_fields'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Beneficiary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(help_text='Nome do beneficiário', max_length=255, verbose_name='Nome do Beneficiário')),
                ('is_system', models.BooleanField(default=False, help_text='Beneficiários criados automaticamente pelo sistema (contas/cartões)', verbose_name='Beneficiário do Sistema')),
                ('is_active', models.BooleanField(default=True, verbose_name='Ativo')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Atualizado em')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='beneficiaries', to=settings.AUTH_USER_MODEL, verbose_name='Usuário')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='beneficiaries', to='accounts.workspace', verbose_name='Workspace')),
            ],
            options={
                'verbose_name': 'Beneficiário',
                'verbose_name_plural': 'Beneficiários',
                'ordering': ['nome'],
            },
        ),
        migrations.AddConstraint(
            model_name='beneficiary',
            constraint=models.UniqueConstraint(fields=('workspace', 'nome'), name='unique_beneficiary_per_workspace'),
        ),
    ]
