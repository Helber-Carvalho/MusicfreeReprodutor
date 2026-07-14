import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MainScreen } from './src/screens/MainScreen';

function App() {
  return (
    <View style={styles.container}>
      <MainScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default App;
