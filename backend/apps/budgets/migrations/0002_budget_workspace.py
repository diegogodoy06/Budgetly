# Generated manually to add workspace field to Budget model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_add_user_profile_fields'),
        ('budgets', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='budget',
            name='workspace',
            field=models.ForeignKey(
                default=1,  # Workspace Padrão
                on_delete=django.db.models.deletion.CASCADE,
                related_name='budgets',
                to='accounts.workspace'
            ),
            preserve_default=False,
        ),
    ]
