import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const COLORS = {
  background: '#f4f4f0',
  textPrimary: '#212121',
  textSecondary: '#555555',
  accentPurple: '#8A2BE2',
  link: '#007AFF',
  borderColor: '#cccccc',
  logoBackground: '#e0e0e0',
};

const AboutScreen = () => {
  const openUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erro', `Não foi possível abrir esta URL: ${url}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/lobogames.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>O Projeto LoboGames</Text>
        <Text style={styles.text}>
          O objetivo geral do projeto é promover a divulgação, a disseminação, o
          interesse pelos Jogos Lógicos de Tabuleiro (ou Jogos Abstratos de
          Estratégia) e seu aprendizado, trazendo como principal benefício o
          exercício do raciocínio lógico.
        </Text>
        <View style={styles.linkContainer}>
          <Text style={styles.text}>Para saber mais, visite</Text>
          <TouchableOpacity
            onPress={() => openUrl('https://www.inf.ufrgs.br/lobogames/')}
          >
            <Text style={styles.linkText}>LoboGames</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          LoboClock e a gestão de tempo em jogos
        </Text>
        <Text style={styles.text}>
          Aplicativos de relógio são essenciais para gerenciar o tempo de forma
          eficaz em uma ampla variedade de jogos baseados em turnos, desde
          partidas clássicas de xadrez até jogos de tabuleiro modernos. Eles
          garantem a justiça, adicionam uma camada estratégica ao forçar os
          jogadores a pensar de forma eficiente e podem alterar
          significativamente a dinâmica de um jogo.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Como usar o LoboClock</Text>
        <Text style={styles.text}>
          1. Clique em "Jogar" e selecione um tipo de estratégia de relógio.
          {'\n'}
          2. Configure as definições de tempo conforme as opções pré definidas.
          {'\n'}
          3. O jogador 2 é responsável por iniciar a contagem do tempo.
          {'\n'}
          4. Quando um jogador ativo completa seu movimento, ele toca em seu
          lado do relógio, passando a vez para o oponente.
          {'\n'}
          5. O jogo termina quando o tempo total de um jogador acaba.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos de relógios e estratégias</Text>
        <Text style={styles.timerTitle}>Clássico</Text>
        <Text style={styles.text}>
          Um timer simples de contagem regressiva sem tempo adicional. Cada
          jogador tem uma quantidade fixa de tempo para todo o jogo.
        </Text>

        <Text style={styles.timerTitle}>Incremento (Fischer)</Text>
        <Text style={styles.text}>
          Similar ao modo Clássico, mas após cada movimento, uma quantidade fixa
          de tempo é adicionada ao relógio do jogador.
        </Text>

        <Text style={styles.timerTitle}>Atraso Bronstein</Text>
        <Text style={styles.text}>
          Similar ao modo Incremento, porém o jogador recebe de volta parte ou
          uma quantidade fixa do tempo decorrido durante seu movimento, até o
          valor máximo do atraso.
        </Text>

        <Text style={styles.timerTitle}>Ampulheta</Text>
        <Text style={styles.text}>
          Quando o relógio de um jogador está correndo, o relógio do outro
          jogador aumenta na mesma proporção, como se fosse uma ampulheta.
        </Text>

        <Text style={styles.timerTitle}>Byo Yomi</Text>
        <Text style={styles.text}>
          Muito utilizado em jogos como Go e Shogi, esse mode consiste em um
          tempo principal seguido por um número fixo de períodos extras. Após o
          tempo principal se esgotar, o jogador precisa fazer sua jogada dentro
          de um desses períodos. Se conseguir, o número de períodos se mantém
          para os próximos lances. Caso contrário, perde-se um período. O jogo
          acaba se o jogador consumir todos os seus períodos extras.
        </Text>

        <Text style={styles.timerTitle}>Canadian Overtime</Text>
        <Text style={styles.text}>
          Também comum em jogos de Go, oferece um tempo principal. Após esse
          tempo, o jogador deve realizar um número específico de jogadas dentro
          de um novo período de tempo . Se conseguir, recebe outro período igual
          para as próximas jogadas, e assim por diante. Se não conseguir, perde
          a partida por tempo.
        </Text>

        <Text style={styles.timerTitle}>Torneio</Text>
        <Text style={styles.text}>
          O modo Torneio é utilizado em competições oficiais, e é composto de
          três fases. Ao completar um número específico de jogadas, um tempo
          extra é adicionado ao relógio do jogador. A partir da terceira fase, o
          jogo passa a ser jogado com o modo Incremento, onde o jogador recebe
          um tempo fixo após cada movimento.
        </Text>

        <Text style={styles.timerTitle}>Personalizado</Text>
        <Text style={styles.text}>
          O LoboClock oferece a capacidade de criar uma{' '}
          <Text style={{ fontWeight: 'bold' }}>estratégia personalizada</Text>.
          Ela permite que o jogador combine elementos das estratégias
          pré-existentes. Por exemplo, é possível projetar um relógio que começa
          com um tempo base clássico, adiciona um incremento após cada
          movimento, entra em modo de tempo extra por jogada com opção de
          acumular o tempo restante do período ou não, e finaliza com uma
          quantidade dinâmica de overtime, que pode ter sua própria
          configuração.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    height: 120,
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.accentPurple,
    marginBottom: 5,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    paddingBottom: 8,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 10,
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accentPurple,
    marginTop: 18,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 25,
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.link,
    textDecorationLine: 'underline',
    marginLeft: 5,
  },
});

export default AboutScreen;
