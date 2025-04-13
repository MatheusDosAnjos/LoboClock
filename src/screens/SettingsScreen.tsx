import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

const SettingsScreen = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [keepScreenOn, setKeepScreenOn] = useState(true);

  const saveSettings = () => {
    // Logic to save settings to persistent storage
    alert('Settings saved successfully!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Sound Effects</Text>
        <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Vibration</Text>
        <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Keep Screen On</Text>
        <Switch value={keepScreenOn} onValueChange={setKeepScreenOn} />
      </View>

      <Text style={styles.settingLabel}>
        Volume: {Math.round(volume * 100)}%
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        onValueChange={setVolume}
        minimumTrackTintColor="#2196F3"
        maximumTrackTintColor="#000000"
        disabled={!soundEnabled}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 30,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 18,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
