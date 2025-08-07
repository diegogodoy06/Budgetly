from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from apps.transactions.models import CreditCardInvoice
from apps.accounts.models import CreditCard


class Command(BaseCommand):
    help = 'Processa fechamento automático de faturas de cartão de crédito'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Executa em modo de teste sem salvar alterações',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        today = date.today()
        
        self.stdout.write(f"Processando fechamento de faturas para {today}")
        
        # Buscar todas as faturas que devem ser fechadas hoje
        faturas_para_fechar = []
        
        # Para cada cartão ativo, verificar se hoje é dia de fechamento OU se a data de fechamento já passou
        for cartao in CreditCard.objects.filter(is_active=True):
            # Se hoje é igual ou posterior ao dia de fechamento, verificar se há fatura aberta para fechar
            if today.day >= cartao.dia_fechamento:
                # Buscar fatura do mês atual que ainda está aberta
                fatura_atual = CreditCardInvoice.objects.filter(
                    credit_card=cartao,
                    mes=today.month,
                    ano=today.year,
                    status='aberta'
                ).first()
                
                if fatura_atual:
                    # Verificar se a data de fechamento realmente passou
                    data_fechamento_fatura = date(today.year, today.month, cartao.dia_fechamento)
                    if today >= data_fechamento_fatura:
                        faturas_para_fechar.append(fatura_atual)
                        self.stdout.write(
                            f"📅 Fatura {cartao.nome} {today.month:02d}/{today.year} será fechada "
                            f"(data fechamento: {data_fechamento_fatura}, hoje: {today})"
                        )
                else:
                    # Se não existe fatura aberta para este mês, criar uma nova
                    # (isso pode acontecer se não houve transações no cartão)
                    vencimento = date(today.year, today.month, cartao.dia_vencimento)
                    if vencimento <= today:
                        # Se o vencimento já passou, vai para o próximo mês
                        if today.month == 12:
                            vencimento = date(today.year + 1, 1, cartao.dia_vencimento)
                        else:
                            vencimento = date(today.year, today.month + 1, cartao.dia_vencimento)
                    
                    if not dry_run:
                        nova_fatura = CreditCardInvoice.objects.create(
                            credit_card=cartao,
                            mes=today.month,
                            ano=today.year,
                            data_fechamento=today,
                            data_vencimento=vencimento,
                            valor_total=0,
                            status='fechada'
                        )
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Criada fatura vazia para {cartao.nome} - {today.month:02d}/{today.year}"
                            )
                        )
        
        # Fechar as faturas encontradas
        total_fechadas = 0
        total_transacoes_criadas = 0
        
        for fatura in faturas_para_fechar:
            if not dry_run:
                # Contar transações antes do fechamento para verificar se há valor
                transacoes_count = fatura.credit_card.transactions.filter(
                    tipo='saida',
                    data__month=fatura.mes,
                    data__year=fatura.ano,
                    confirmada=True
                ).count()
                
                fatura.fechar_fatura()
                total_fechadas += 1
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f"💳 Fatura {fatura.credit_card.nome} - "
                        f"{fatura.mes:02d}/{fatura.ano} fechada - "
                        f"Transações confirmadas automaticamente"
                    )
                )
                
                if fatura.valor_total > 0:
                    total_transacoes_criadas += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Fechada fatura {fatura.credit_card.nome} - "
                            f"{fatura.mes:02d}/{fatura.ano} - "
                            f"Valor: R$ {fatura.valor_total:,.2f} - "
                            f"Transação de pagamento criada"
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Fechada fatura {fatura.credit_card.nome} - "
                            f"{fatura.mes:02d}/{fatura.ano} - "
                            f"Sem valor (nenhuma transação)"
                        )
                    )
            else:
                self.stdout.write(
                    f"[DRY RUN] Fecharia fatura {fatura.credit_card.nome} - "
                    f"{fatura.mes:02d}/{fatura.ano}"
                )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"[DRY RUN] {len(faturas_para_fechar)} faturas seriam fechadas"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Processamento concluído: {total_fechadas} faturas fechadas, "
                    f"{total_transacoes_criadas} transações de pagamento criadas"
                )
            )
