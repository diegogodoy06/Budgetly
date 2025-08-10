#!/bin/bash

# Script para executar tanto a Landing Page quanto o Sistema Principal
echo "🚀 Iniciando Budgetly - Aplicações Completas"
echo ""

# Função para matar processos quando o script for interrompido
cleanup() {
    echo ""
    echo "🛑 Parando todas as aplicações..."
    kill $LANDING_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Verificar se as dependências estão instaladas
echo "📦 Verificando dependências..."

if [ ! -d "landing-page/node_modules" ]; then
    echo "⚠️  Instalando dependências da Landing Page..."
    cd landing-page && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Instalando dependências do Frontend..."
    cd frontend && npm install && cd ..
fi

echo "✅ Dependências verificadas"
echo ""

# Iniciar Landing Page (porta 3001)
echo "🌟 Iniciando Landing Page na porta 3001..."
cd landing-page
npm run dev > ../landing.log 2>&1 &
LANDING_PID=$!
cd ..

# Aguardar um pouco para a Landing Page iniciar
sleep 3

# Iniciar Frontend Principal (porta 3000)
echo "💼 Iniciando Sistema Principal na porta 3000..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Aguardar um pouco para o frontend iniciar
sleep 3

echo ""
echo "🎉 Aplicações iniciadas com sucesso!"
echo ""
echo "📍 URLs disponíveis:"
echo "   Landing Page: http://localhost:3001"
echo "   Sistema Principal: http://localhost:3000"
echo "   Backend (Django): http://localhost:8000"
echo ""
echo "💡 Pressione Ctrl+C para parar todas as aplicações"
echo ""

# Aguardar indefinidamente
wait