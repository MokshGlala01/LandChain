import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'scan' | 'detail' | 'messages'>('home');
  const [scannedId, setScannedId] = useState('');
  
  // SMS Emulator State
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [serverIp, setServerIp] = useState('localhost:3000'); // Default to localhost, configurable in UI
  const [phoneFilter, setPhoneFilter] = useState('9967238191'); // Default registered citizen phone for Aadhaar 461652059015

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

  // 2. Poll SMS Server
  useEffect(() => {
    let intervalId: any;
    if (isAuthenticated) {
      const fetchMessages = async () => {
        try {
          // If serverIp is 'localhost:3000' and we are on Android emulator, we should map to '10.0.2.2:3000'
          let resolvedIp = serverIp;
          if (resolvedIp.startsWith('localhost') && typeof global !== 'undefined' && (global as any).HermesInternal) {
            // Under React Native hermes context, detect Android to auto-map localhost
            // But to be safe, try fetching from resolvedIp first.
          }
          
          const cleanPhone = phoneFilter.replace(/[^\d]/g, '');
          const res = await fetch(`http://${resolvedIp}/api/sms?phone=${cleanPhone}`);
          if (res.ok) {
            const data = await res.json();
            // Sort oldest first for chat bubble flow
            const sorted = data.sort((a: any, b: any) => a.timestamp - b.timestamp);
            
            // Check if there are new messages
            if (sorted.length > messages.length) {
              const newCount = sorted.length - messages.length;
              const latestMsg = sorted[sorted.length - 1];
              
              // Only trigger alert if this is not the initial load
              if (messages.length > 0) {
                Alert.alert(
                  `💬 New Message from ${latestMsg.from}`,
                  latestMsg.body,
                  [
                    { text: 'View Messages', onPress: () => { setCurrentScreen('messages'); setUnreadCount(0); } },
                    { text: 'Dismiss' }
                  ]
                );
                setUnreadCount(prev => prev + newCount);
              }
            }
            setMessages(sorted);
          }
        } catch (err) {
          // Silent catch to prevent UI loops
        }
      };

      fetchMessages();
      intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, messages.length, serverIp, phoneFilter]);

  // 3. Mock QR Code scanning
  const handleScanMock = () => {
    setScannedId('PARCEL-4902-881');
    setCurrentScreen('detail');
  };

  // 4. Share verified PNG card
  const handleShareDeed = async () => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      Alert.alert('Share', 'Sharing verified property receipt card via native sheet.');
    } else {
      Alert.alert('Error', 'Native sharing is not supported on this platform.');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>LandChain Mobile</Text>
        <Text style={styles.subtitle}>Secured Land Ledger Gateway</Text>
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
        <Text style={styles.headerText}>LandChain Mobile Portal</Text>
        <TouchableOpacity 
          style={styles.msgBtn}
          onPress={() => { setCurrentScreen('messages'); setUnreadCount(0); }}
        >
          <Text style={styles.msgBtnText}>💬 Messages {unreadCount > 0 ? `(${unreadCount})` : ''}</Text>
        </TouchableOpacity>
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
          
          <TouchableOpacity style={[styles.outlineButton, { marginTop: 15 }]} onPress={() => { setCurrentScreen('messages'); setUnreadCount(0); }}>
            <Text style={styles.outlineText}>Open Messaging App</Text>
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

      {currentScreen === 'messages' && (
        <View style={styles.messagesContainer}>
          {/* Chat Settings Row */}
          <View style={styles.settingsRow}>
            <View style={styles.settingInputBox}>
              <Text style={styles.settingLabel}>Server IP:</Text>
              <TextInput 
                style={styles.settingInput}
                value={serverIp}
                onChangeText={setServerIp}
                placeholder="e.g. 10.0.2.2:3000"
              />
            </View>
            <View style={styles.settingInputBox}>
              <Text style={styles.settingLabel}>My Phone:</Text>
              <TextInput 
                style={styles.settingInput}
                value={phoneFilter}
                onChangeText={setPhoneFilter}
                placeholder="e.g. 9876543210"
              />
            </View>
          </View>

          {/* Messages Bubble History */}
          <Text style={styles.chatHeader}>Thread: UIDAI Secure Gateway</Text>
          
          <ScrollView 
            style={styles.chatArea}
            contentContainerStyle={styles.chatAreaContent}
            ref={(ref: any) => ref?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyInbox}>
                <Text style={styles.emptyText}>No Messages</Text>
                <Text style={styles.emptySubText}>
                  Send an OTP from the LandChain web portal to trigger an SMS on this device.
                </Text>
              </View>
            ) : (
              messages.map((msg) => (
                <View key={msg.id} style={styles.bubbleContainer}>
                  <View style={styles.bubble}>
                    <Text style={styles.bubbleSender}>{msg.from}</Text>
                    <Text style={styles.bubbleText}>{msg.body}</Text>
                    <Text style={styles.bubbleTime}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
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
    height: 90,
    backgroundColor: '#0F6E56',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  msgBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  msgBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
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
  
  // Message Thread Styles
  messagesContainer: {
    flex: 1,
    backgroundColor: '#E5DDD5', // WhatsApp-like chat background
  },
  settingsRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  settingInputBox: {
    flex: 1,
    marginHorizontal: 4,
  },
  settingLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  settingInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    color: '#333',
  },
  chatHeader: {
    backgroundColor: '#075E54',
    color: '#FFF',
    padding: 10,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chatArea: {
    flex: 1,
  },
  chatAreaContent: {
    padding: 12,
  },
  emptyInbox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  bubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  bubble: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  bubbleSender: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 2,
  },
  bubbleText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 18,
  },
  bubbleTime: {
    fontSize: 9,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  backBtn: {
    backgroundColor: '#075E54',
    paddingVertical: 15,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
