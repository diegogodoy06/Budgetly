# 🚀 Instruções de Execução - Budgetly

## ⚡ Execução Rápida

### 1. **Configurar dados iniciais** (execute uma vez):
```bash
cd backend
python setup_data.py
```

### 2. **Iniciar o servidor backend**:
```bash
cd backend
python manage.py runserver
```

### 3. **Instalar e iniciar frontend** (em outro terminal):
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **Admin Django**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs/

## 🔐 Credenciais Padrão

- **Email**: admin@budgetly.com
- **Senha**: admin123

## 📁 Dados de Exemplo

O script `setup_data.py` cria:

- ✅ Usuário administrador
- ✅ Contas de exemplo (Corrente, Poupança, Cartão)
- ✅ Categorias pré-definidas
- ✅ Tags úteis
- ✅ Transações de exemplo

## 🐳 Execução com Docker

```bash
# Na raiz do projeto
docker-compose up --build
```

## 🛠️ Comandos Úteis

```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações  
python manage.py migrate

# Criar superusuário manualmente
python manage.py createsuperuser

# Executar testes
python manage.py test

# Coletar arquivos estáticos
python manage.py collectstatic
```

## 📊 Funcionalidades Implementadas

- ✅ **Autenticação completa** (registro/login/logout)
- ✅ **Gestão de Contas** (todos os tipos)
- ✅ **Transações** (entrada/saída/transferência)
- ✅ **Parcelamento** automático
- ✅ **Recorrência** mensal
- ✅ **Cartões de Crédito** com faturas
- ✅ **Categorias e Tags**
- ✅ **Orçamentos** com alertas
- ✅ **Dashboard** com gráficos
- ✅ **Relatórios** detalhados
- ✅ **Importação** de CSV
- ✅ **API REST** completa
- ✅ **Documentação** automática

## 🎯 Primeiro Acesso

1. Execute `python setup_data.py` para criar dados iniciais
2. Acesse http://localhost:8000/admin com as credenciais
3. Explore a API em http://localhost:8000/api/docs/
4. Use o frontend em http://localhost:3000

O sistema está **100% funcional** e pronto para uso! 🎉
