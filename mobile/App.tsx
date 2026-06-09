import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'scan' | 'detail'>('home');
  const [scannedId, setScannedId] = useState('');

  // 1. Biometrics Local Auth check
  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback for emulator/mock tests
        setIsAuthenticated(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to LandChain Secure Portal',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        setIsAuthenticated(true);
      } else {
        Alert.alert('Authentication Failed', 'Invalid credentials.');
      }
    } catch (err) {
      setIsAuthenticated(true); // fallback
    }
  };

  // 2. Mock QR Code scanning
  const handleScanMock = () => {
    setScannedId('PARCEL-4902-881');
    setCurrentScreen('detail');
  };

  // 3. Share verified PNG card
  const handleShareDeed = async () => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      // In a live app we generate a local file path
      // await Sharing.shareAsync(localFileUri);
      Alert.alert('Share', 'Sharing verified property receipt card via native sheet.');
    } else {
      Alert.alert('Error', 'Native sharing is not supported on this platform.');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>LandChain Mobile</Text>
        <Text style={styles.subtitle}>Secured Land Mutation Ledger Gateway</Text>
        <TouchableOpacity style={styles.button} onPress={handleBiometricAuth}>
          <Text style={styles.buttonText}>Authorize Biometric Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.headerText}>LandChain Registry</Text>
      </View>

      {/* Screen Panels */}
      {currentScreen === 'home' && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>My Assessed Assets</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sector 62, Noida, UP</Text>
            <Text style={styles.cardSub}>ID: PARCEL-4902-881 | Area: 2,400 Sq Ft</Text>
            <TouchableOpacity style={styles.cardBtn} onPress={() => { setScannedId('PARCEL-4902-881'); setCurrentScreen('detail'); }}>
              <Text style={styles.cardBtnText}>Verify Provenance Details</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('scan')}>
            <Text style={styles.buttonText}>Activate QR Scanner</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {currentScreen === 'scan' && (
        <View style={styles.scanContainer}>
          <Text style={styles.scanText}>[ Expo Camera Viewfinder active ]</Text>
          <TouchableOpacity style={styles.button} onPress={handleScanMock}>
            <Text style={styles.buttonText}>Scan Mock QR (PARCEL-4902-881)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} onPress={() => setCurrentScreen('home')}>
            <Text style={styles.outlineText}>Cancel Scanner</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentScreen === 'detail' && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Property Provenance details</Text>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Parcel Identifier:</Text>
            <Text style={styles.detailVal}>{scannedId}</Text>
            
            <Text style={styles.detailLabel}>Status Badge:</Text>
            <Text style={styles.detailVal}>ACTIVE (On-chain signed)</Text>

            <Text style={styles.detailLabel}>Satellite NDVI Green Cover:</Text>
            <Text style={styles.detailVal}>1.4 Hectares (NDVI 0.62)</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleShareDeed}>
            <Text style={styles.buttonText}>Share Verified receipt Card</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} onPress={() => setCurrentScreen('home')}>
            <Text style={styles.outlineText}>Back to Assets</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F0D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 80,
    backgroundColor: '#0F6E56',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 15,
  },
  headerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#0F6E56',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  outlineButton: {
    borderColor: '#0F6E56',
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  outlineText: {
    color: '#0F6E56',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 15,
    color: '#334155',
  },
  card: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
  },
  cardBtn: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cardBtnText: {
    color: '#0F6E56',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scanText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 14,
    color: '#1E293B',
    marginTop: 4,
    marginBottom: 16,
  },
});
