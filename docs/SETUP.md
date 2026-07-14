# Setup do Projeto

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Android Studio (com SDK 24+)
- Java 17+ (JDK) — usar o JBR bundled do Android Studio
- **Importante:** Caminho do projeto SEM acentos ou caracteres especiais (ex: `C:\dev\musicApp`)

## Variáveis de Ambiente

Configure no Windows (PowerShell como Admin):

```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```

Adicione ao PATH:
```powershell
[Environment]::SetEnvironmentVariable("Path", "$env:Path;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\emulator", "User")
```

## Localização do Projeto

O projeto está em **`C:\dev\musicApp`** (não usar caminhos com acentos).

## Instalação

```bash
cd C:\dev\musicApp

# Instalar dependências
npm install

# Rodar no Android
npx react-native run-android

# Limpar cache (se necessário)
npx react-native start --reset-cache
```

## Estrutura para Adicionar Novas Features

1. Crie/edite o modelo em `src/models/`
2. Implemente a lógica em `src/services/`
3. Crie os componentes em `src/components/`
4. Adicione a tela em `src/screens/`
5. Atualize o arquivo de arquitetura em `docs/`

## Commits

Use commits semânticos:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `refactor:` refatoração
