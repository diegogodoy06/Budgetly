"""
Script simples para testar workspaces usando curl via PowerShell
"""

print("""
🧪 TESTE DE ISOLAÇÃO DE WORKSPACES
=================================

Para testar se o sistema está funcionando, execute os seguintes comandos no PowerShell:

1. FAZER LOGIN:
curl -X POST http://localhost:8000/api/accounts/login/ -H "Content-Type: application/json" -d "{\"email\":\"admin@budgetly.com\",\"password\":\"admin123\"}"

2. COPIE O TOKEN DA RESPOSTA e substitua TOKEN_AQUI nos comandos abaixo:

3. LISTAR WORKSPACES:
curl -X GET http://localhost:8000/api/accounts/workspaces/ -H "Authorization: Bearer TOKEN_AQUI"

4. COPIE OS IDs dos workspaces e teste contas em cada um:

5. VER CONTAS DO WORKSPACE 1:
curl -X GET http://localhost:8000/api/accounts/accounts/ -H "Authorization: Bearer TOKEN_AQUI" -H "X-Workspace-ID: 1"

6. VER CONTAS DO WORKSPACE 2:
curl -X GET http://localhost:8000/api/accounts/accounts/ -H "Authorization: Bearer TOKEN_AQUI" -H "X-Workspace-ID: 2"

7. CRIAR CONTA DE TESTE NO WORKSPACE 1:
curl -X POST http://localhost:8000/api/accounts/accounts/ -H "Authorization: Bearer TOKEN_AQUI" -H "X-Workspace-ID: 1" -H "Content-Type: application/json" -d "{\"name\":\"Conta Workspace 1\",\"type\":\"checking\",\"saldo_atual\":\"1000.00\"}"

8. CRIAR CONTA DE TESTE NO WORKSPACE 2:
curl -X POST http://localhost:8000/api/accounts/accounts/ -H "Authorization: Bearer TOKEN_AQUI" -H "X-Workspace-ID: 2" -H "Content-Type: application/json" -d "{\"name\":\"Conta Workspace 2\",\"type\":\"checking\",\"saldo_atual\":\"2000.00\"}"

Depois disso, teste no frontend:
- Faça login no sistema
- Troque entre os workspaces no menu
- Verifique se as contas são diferentes em cada workspace

Se você ver contas diferentes em cada workspace, o sistema está funcionando! ✅
""")

print("💡 DICA: Se preferir, também pode testar direto no frontend:")
print("1. Abra o DevTools (F12)")
print("2. Vá para a aba Network")
print("3. Troque de workspace")
print("4. Veja se as requisições estão sendo feitas com X-Workspace-ID diferentes")
print("5. Verifique se as respostas retornam dados diferentes")
