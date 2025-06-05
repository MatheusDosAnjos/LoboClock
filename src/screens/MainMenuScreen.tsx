import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/AppNavigator';

type MainMenuNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainMenu'
>;

// Helper component for logo placeholders - now accepts a source object
type LogoPlaceholderProps = {
  imageSource: number;
};

const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({ imageSource }) => (
  <View style={styles.logoPlaceholderContainer}>
    <Image
      source={imageSource}
      style={styles.logoPlaceholderImage}
      resizeMode="contain"
    />
  </View>
);

const MainMenuScreen = () => {
  const navigation = useNavigation<MainMenuNavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f4f0" />
      <View style={styles.outerContainer}>
        <View style={styles.mainContentContainer}>
          <View style={styles.topLogosContainer}>
            <LogoPlaceholder imageSource={require('../../assets/ufrgs.png')} />
            <LogoPlaceholder imageSource={require('../../assets/inf.png')} />
          </View>

          <View style={styles.logoTitleContainer}>
            <Image
              source={require('../../assets/icon-foreground.png')}
              style={styles.mainLogo}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>LoboClock</Text>
            <Text style={styles.subtitle}>
              Seu companheiro para gerenciar o tempo em jogos!
            </Text>
          </View>

          {/* Botões de Ação */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.playButton]}
              onPress={() => navigation.navigate('TimerSelection')}
            >
              <Text style={styles.buttonText}>Jogar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.aboutButton]}
              onPress={() => navigation.navigate('About')}
            >
              <Text style={styles.buttonText}>Sobre</Text>
            </TouchableOpacity>
          </View>

          {/* Rodapé Simples */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              &copy; {new Date().getFullYear()} LoboClock. Todos os direitos
              reservados.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f0',
  },
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 0,
    paddingTop: Platform.OS === 'ios' ? 24 : 20,
    paddingHorizontal: Platform.OS === 'ios' ? 24 : 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  topLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 50,
  },
  logoPlaceholderContainer: {
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderImage: {
    width: '100%',
    height: '100%',
  },
  logoTitleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    flexShrink: 1,
  },
  mainLogo: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666666',
    marginTop: 6,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    flexShrink: 0,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    width: '90%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  aboutButton: {
    backgroundColor: '#8A2BE2',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  footerText: {
    color: '#888888',
    fontSize: 12,
  },
});

export default MainMenuScreen;
