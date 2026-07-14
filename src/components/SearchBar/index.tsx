/**
 * SearchBar / index.tsx — Campo de busca/filtro de músicas.
 *
 * Componente controlado: o valor e a função de atualização vêm do pai.
 * Filtra a lista de músicas por título ou artista em tempo real.
 *
 * Exemplo de uso:
 *   <SearchBar value={search} onChangeText={setSearch} />
 */

import { View, TextInput } from 'react-native';
import { styles } from './styles';

/** Propriedades recebidas do componente pai (Home) */
interface SearchBarProps {
  /** Valor atual do campo de texto (controlled component) */
  value: string;
  /** Callback disparado a cada tecla digitada */
  onChangeText: (text: string) => void;
  /** Texto de placeholder (opcional, com valor padrão) */
  placeholder?: string;
}

/**
 * Componente SearchBar — input de busca estilizado para tema escuro.
 *
 * @param value — Texto atual do campo (vindo do state do pai)
 * @param onChangeText — Atualiza o state de busca no pai
 * @param placeholder — Dica exibida quando o campo está vazio (padrão: "Search artist or song...")
 */
export function SearchBar({ value, onChangeText, placeholder = 'Search artist or song...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
      />
    </View>
  );
}
