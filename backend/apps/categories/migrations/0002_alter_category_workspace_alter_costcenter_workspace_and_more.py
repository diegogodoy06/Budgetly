# Generated manually to update workspace fields

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='workspace',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='categories',
                to='accounts.workspace'
            ),
        ),
        migrations.AlterField(
            model_name='costcenter',
            name='workspace',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='cost_centers',
                to='accounts.workspace'
            ),
        ),
        migrations.AlterField(
            model_name='tag',
            name='workspace',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='tags',
                to='accounts.workspace'
            ),
        ),
    ]
