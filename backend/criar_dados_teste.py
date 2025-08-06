"""
Script para criar dados de teste nos workspaces via curl
"""

import subprocess
import json
import sys

def run_curl(command):
    """Executa comando curl e retorna resultado"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            return json.loads(result.stdout) if result.stdout.strip() else {}
        else:
            print(f"Erro: {result.stderr}")
            return None
    except Exception as e:
        print(f"Erro ao executar comando: {e}")
        return None

def main():
    print("🔐 Fazendo login...")
    
    # 1. Login
    login_cmd = '''curl -s -X POST http://localhost:8000/api/accounts/login/ -H "Content-Type: application/json" -d "{\\"email\\":\\"admin@budgetly.com\\",\\"password\\":\\"admin123\\"}"'''
    
    login_result = run_curl(login_cmd)
    if not login_result or 'token' not in login_result:
        print("❌ Erro no login!")
        return
    
    token = login_result['token']
    print(f"✅ Login realizado! Token: {token[:20]}...")
    
    # 2. Listar workspaces
    print("\n📋 Listando workspaces...")
    ws_cmd = f'''curl -s -X GET http://localhost:8000/api/accounts/workspaces/ -H "Authorization: Bearer {token}"'''
    
    workspaces_result = run_curl(ws_cmd)
    if not workspaces_result:
        print("❌ Erro ao listar workspaces!")
        return
    
    workspaces = workspaces_result.get('results', [])
    print(f"Workspaces encontrados: {len(workspaces)}")
    
    for ws in workspaces:
        print(f"  - ID: {ws['id']}, Nome: {ws['name']}")
    
    # 3. Criar dados de teste em cada workspace
    for i, workspace in enumerate(workspaces[:2]):  # Apenas primeiros 2
        workspace_id = workspace['id']
        workspace_name = workspace['name']
        
        print(f"\n🏢 Criando dados no workspace '{workspace_name}' (ID: {workspace_id})")
        
        # Criar conta de teste
        account_name = f"Conta {workspace_name}"
        account_balance = str((i + 1) * 1000)  # 1000, 2000, etc.
        
        account_cmd = f'''curl -s -X POST http://localhost:8000/api/accounts/accounts/ -H "Authorization: Bearer {token}" -H "X-Workspace-ID: {workspace_id}" -H "Content-Type: application/json" -d "{{\\"name\\":\\"{account_name}\\",\\"type\\":\\"checking\\",\\"saldo_atual\\":\\"{account_balance}.00\\"}}"'''
        
        account_result = run_curl(account_cmd)
        if account_result and 'id' in account_result:
            print(f"  ✅ Conta criada: {account_result['name']} - R$ {account_result['saldo_atual']}")
        else:
            print(f"  ❌ Erro ao criar conta no workspace {workspace_id}")
            
        # Criar cartão de crédito de teste
        card_name = f"Cartão {workspace_name}"
        card_limit = str((i + 1) * 5000)  # 5000, 10000, etc.
        
        card_cmd = f'''curl -s -X POST http://localhost:8000/api/accounts/credit-cards/ -H "Authorization: Bearer {token}" -H "X-Workspace-ID: {workspace_id}" -H "Content-Type: application/json" -d "{{\\"name\\":\\"{card_name}\\",\\"limit\\":\\"{card_limit}.00\\",\\"closing_day\\":5,\\"due_day\\":15}}"'''
        
        card_result = run_curl(card_cmd)
        if card_result and 'id' in card_result:
            print(f"  ✅ Cartão criado: {card_result['name']} - Limite: R$ {card_result['limit']}")
        else:
            print(f"  ❌ Erro ao criar cartão no workspace {workspace_id}")
    
    print(f"\n🎉 Dados de teste criados! Agora teste a troca de workspace no frontend.")
    print(f"💡 Você deve ver contas e cartões diferentes em cada workspace!")

if __name__ == "__main__":
    main()
