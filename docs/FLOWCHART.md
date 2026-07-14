# Fluxograma do App

```
┌───────────────────────────────┐
│          MainScreen           │
│  Interface principal do app   │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Verificar permissões Android  │
│ (Leitura de mídia)            │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      MusicRepository          │
│ Ler músicas usando MediaStore │
│ Ignorar pastas do WhatsApp    │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│     Lista de Music (Model)    │
│ Nome / Artista / Álbum        │
│ Duração / Caminho             │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      FlatList + MusicList     │
│ Exibir lista de músicas       │
└───────────────┬───────────────┘
                │
         Usuário seleciona música
                │
                ▼
┌───────────────────────────────┐
│         PlayerManager         │
│ Controla a reprodução         │
│                               │
│ • Play                        │
│ • Pause                       │
│ • Próxima                     │
│ • Anterior                    │
│ • Seek                        │
│ • Atualizar progresso         │
│ • Detectar fim da música      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│     react-native-track-player │
│ Reprodução do áudio           │
└───────────────┬───────────────┘
                │
                ├──────────────► Atualizar SeekBar
                │
                ├──────────────► Atualizar tempo atual
                │
                ├──────────────► Atualizar nome da música
                │
                ├──────────────► Atualizar notificação
                │
                ▼
      Música terminou?
           │
      ┌────┴────┐
      │         │
     Não       Sim
      │         │
      │         ▼
      │   Próxima música
      │         │
      └─────────┘
```

## Mapeamento Android Nativo → React Native

| Android Nativo       | React Native              |
|----------------------|---------------------------|
| MainActivity         | MainScreen.tsx            |
| RecyclerView         | FlatList                  |
| MusicAdapter         | MusicList.tsx             |
| MusicService         | PlayerManager.ts          |
| PlayerManager        | PlayerManager.ts          |
| MediaPlayer          | react-native-track-player |
| MediaStore           | MusicRepository.ts        |
