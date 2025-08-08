from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
import calendar
from apps.accounts.models import CreditCard
from apps.transactions.models import CreditCardInvoice


class Command(BaseCommand):
    help = 'Gera faturas de cartão de crédito para o mês atual e próximo'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mes',
            type=int,
            help='Mês para gerar faturas (1-12). Padrão: mês atual'
        )
        parser.add_argument(
            '--ano',
            type=int,
            help='Ano para gerar faturas. Padrão: ano atual'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Força a criação mesmo se já existir fatura para o período'
        )

    def handle(self, *args, **options):
        today = date.today()
        mes = options['mes'] or today.month
        ano = options['ano'] or today.year
        force = options['force']

        self.stdout.write(f'Gerando faturas para {mes:02d}/{ano}...')

        credit_cards = CreditCard.objects.filter(is_active=True)
        created_count = 0
        skipped_count = 0

        for card in credit_cards:
            # Verificar se já existe fatura para este período
            existing_invoice = CreditCardInvoice.objects.filter(
                credit_card=card,
                mes=mes,
                ano=ano
            ).first()

            if existing_invoice and not force:
                self.stdout.write(
                    self.style.WARNING(
                        f'Fatura já existe para {card.nome} em {mes:02d}/{ano} - pulando'
                    )
                )
                skipped_count += 1
                continue

            if existing_invoice and force:
                # Deletar fatura existente se forçando
                existing_invoice.delete()
                self.stdout.write(
                    self.style.WARNING(
                        f'Fatura existente deletada para {card.nome} em {mes:02d}/{ano}'
                    )
                )

            try:
                # Calcular datas de fechamento e vencimento
                data_fechamento = date(ano, mes, card.dia_fechamento)
                
                # O vencimento deve ser sempre DEPOIS do fechamento
                # Se o dia de vencimento for menor ou igual ao dia de fechamento,
                # o vencimento vai para o próximo mês
                if card.dia_vencimento <= card.dia_fechamento:
                    if mes == 12:
                        data_vencimento = date(ano + 1, 1, card.dia_vencimento)
                    else:
                        data_vencimento = date(ano, mes + 1, card.dia_vencimento)
                else:
                    # Se o dia de vencimento é maior que o dia de fechamento,
                    # fica no mesmo mês
                    data_vencimento = date(ano, mes, card.dia_vencimento)

                # Criar a fatura
                invoice = CreditCardInvoice.objects.create(
                    credit_card=card,
                    mes=mes,
                    ano=ano,
                    data_fechamento=data_fechamento,
                    data_vencimento=data_vencimento,
                    status='aberta'
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Fatura criada para {card.nome} - '
                        f'Fechamento: {data_fechamento.strftime("%d/%m/%Y")} - '
                        f'Vencimento: {data_vencimento.strftime("%d/%m/%Y")}'
                    )
                )
                created_count += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Erro ao criar fatura para {card.nome}: {str(e)}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nResumo: {created_count} faturas criadas, {skipped_count} puladas'
            )
        )

    def _get_next_month_date(self, current_date, day):
        """Retorna uma data no próximo mês"""
        if current_date.month == 12:
            return date(current_date.year + 1, 1, day)
        else:
            next_month = current_date.month + 1
            # Verificar se o dia existe no próximo mês
            last_day = calendar.monthrange(current_date.year, next_month)[1]
            if day > last_day:
                day = last_day
            return date(current_date.year, next_month, day)
