# Arquitetura do Music App

## Estrutura de Pastas

```
src/
├── screens/          # Telas do app
│   └── MainScreen.tsx
├── components/       # Componentes reutilizáveis
│   ├── MusicList.tsx
│   └── PlayerControls.tsx
├── services/         # Lógica de negócio e serviços
│   ├── MusicRepository.ts
│   └── PlayerManager.ts
├── models/           # Interfaces e modelos de dados
│   └── Music.ts
├── utils/            # Utilitários (permissões, etc)
│   └── Permissions.ts
└── types/            # Tipos compartilhados
    └── index.ts
```

## Fluxo da Aplicação

1. **MainScreen** é a tela principal
2. Ao abrir, solicita permissões de leitura de mídia (Android)
3. **MusicRepository** carrega as músicas do dispositivo usando MediaStore
4. As músicas são exibidas em uma **MusicList** (FlatList)
5. Ao selecionar uma música, o **PlayerManager** inicia a reprodução
6. **PlayerControls** exibe os controles (play, pause, next, previous, seek)

## Tecnologias

- React Native 0.86
- TypeScript
- react-native-safe-area-context
