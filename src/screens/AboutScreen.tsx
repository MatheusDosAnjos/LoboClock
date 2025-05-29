import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Como usar o Relógio de Xadrez</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uso Básico</Text>
        <Text style={styles.text}>
          1. Selecione um tipo de cronômetro no menu Jogar{'\n'}
          2. Configure o tempo como desejar{'\n'}
          3. Toque em "Iniciar Jogo"{'\n'}
          4. O primeiro jogador toca no seu lado do relógio ao finalizar sua jogada{'\n'}
          5. Os jogadores alternam tocando em seu lado ao finalizarem suas jogadas{'\n'}
          6. O jogo termina quando o tempo de um dos jogadores acaba
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos de Cronômetro</Text>

        <Text style={styles.timerTitle}>Clássico</Text>
        <Text style={styles.text}>
          Um cronômetro simples de contagem regressiva, sem tempo adicional. Cada jogador tem um tempo fixo para toda a partida.
        </Text>

        <Text style={styles.timerTitle}>Incremento (Fischer)</Text>
        <Text style={styles.text}>
          Após cada jogada, uma quantidade fixa de tempo é adicionada ao relógio do jogador. Isso incentiva jogadas rápidas no início para acumular tempo para posições críticas no final.
        </Text>

        <Text style={styles.timerTitle}>Delay Bronstein</Text>
        <Text style={styles.text}>
          Quando o tempo de um jogador é pausado após uma jogada, ele recebe de volta parte ou todo o tempo gasto durante a jogada, até o limite máximo do delay.
        </Text>

        <Text style={styles.timerTitle}>Ampulheta</Text>
        <Text style={styles.text}>
          Quando o relógio de um jogador está correndo, o relógio do outro aumenta na mesma proporção. Isso cria uma dinâmica onde jogar rápido pode aumentar sua vantagem de tempo.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controles</Text>
        <Text style={styles.text}>
          • Toque no seu lado do relógio para encerrar seu turno{'\n'}
          • Use os botões centrais para pausar/retomar ou reiniciar o jogo{'\n'}
          • O lado do jogador ativo ficará destacado{'\n'}
          • Toque em "Mudar Cronômetro" para escolher outro método de tempo
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AboutScreen;
