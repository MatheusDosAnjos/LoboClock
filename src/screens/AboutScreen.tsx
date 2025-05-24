import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>How to Use the Chess Clock</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Usage</Text>
        <Text style={styles.text}>
          1. Select a timer type from the Play menu{'\n'}
          2. Configure time settings as desired{'\n'}
          3. Tap "Start Game"{'\n'}
          4. The first player taps their side of the clock when their move is
          complete{'\n'}
          5. Players alternate tapping their side when their moves are complete
          {'\n'}
          6. The game ends when one player's time runs out
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timer Types</Text>

        <Text style={styles.timerTitle}>Classical</Text>
        <Text style={styles.text}>
          A simple countdown timer with no additional time. Each player has a
          fixed amount of time for the entire game.
        </Text>

        <Text style={styles.timerTitle}>Increment (Fischer)</Text>
        <Text style={styles.text}>
          After each move, a fixed amount of time is added to the player's
          clock. This encourages faster play early to bank time for later
          critical positions.
        </Text>

        <Text style={styles.timerTitle}>Bronstein Delay</Text>
        <Text style={styles.text}>
          When a player's time is paused after making a move, they receive back
          some or all of the time elapsed during their move, up to the maximum
          delay amount.
        </Text>

        <Text style={styles.timerTitle}>Hourglass</Text>
        <Text style={styles.text}>
          When one player's clock is running, the other player's clock increases
          by the same amount. This creates a dynamic where moving quickly can
          actually increase your time advantage.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controls</Text>
        <Text style={styles.text}>
          • Tap your side of the clock to end your turn{'\n'}• Use the center
          buttons to pause/resume or reset the game{'\n'}• The active player's
          side will be highlighted{'\n'}• Tap "Change Timer" to select a
          different timing method
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
