from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0004_remove_observacoes_field'),
    ]

    operations = [
        # Índices para otimizar consultas de saldo das contas
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_transaction_account_confirmada ON transactions_transaction(account_id, confirmada) WHERE confirmada = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_transaction_account_confirmada;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_transaction_to_account_confirmada ON transactions_transaction(to_account_id, confirmada) WHERE confirmada = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_transaction_to_account_confirmada;"
        ),
        # Índices para otimizar consultas de saldo dos cartões
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_transaction_credit_card_confirmada ON transactions_transaction(credit_card_id, confirmada) WHERE confirmada = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_transaction_credit_card_confirmada;"
        ),
        # Índice composto para otimizar filtros por tipo e confirmação
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_transaction_tipo_confirmada ON transactions_transaction(tipo, confirmada) WHERE confirmada = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_transaction_tipo_confirmada;"
        ),
    ]
