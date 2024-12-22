import { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Safeguard from 'react-native-safeguard';

Safeguard.initialize({
  rootCheckState: 'ERROR',
  developerOptionsCheckState: 'WARNING',
  malwareCheckState: 'WARNING',
  tamperingCheckState: 'WARNING',
  networkSecurityCheckState: 'WARNING',
  screenSharingCheckState: 'WARNING',
  appSpoofingCheckState: 'WARNING',
  keyloggerCheckState: 'WARNING',
}).catch((error) => {
  console.error('Failed to initialize Safeguard:', error);
});

export default function App() {
  const handleSecurityCheck = async (
    checkFunction: () => Promise<any>,
    checkName: string
  ) => {
    try {
      const result = await checkFunction();
      Alert.alert(
        checkName,
        `Status: ${result.status}\nMessage: ${result.message}`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const SecurityButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Safe Guard</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Safe Guard Demo</Text>
        <SecurityButton
          title="CHECK ROOT STATUS"
          onPress={() => handleSecurityCheck(Safeguard.checkRoot, 'Root Check')}
        />
        <SecurityButton
          title="CHECK DEVELOPER OPTIONS"
          onPress={() =>
            handleSecurityCheck(
              Safeguard.checkDeveloperOptions,
              'Developer Options Check'
            )
          }
        />
        <SecurityButton
          title="CHECK NETWORK SECURITY"
          onPress={() =>
            handleSecurityCheck(Safeguard.checkNetwork, 'Network Security Check')
          }
        />
        <SecurityButton
          title="CHECK MALWARE/TAMPERING"
          onPress={() =>
            handleSecurityCheck(
              Safeguard.checkMalware, 
              'Malware Check'
            )
          }
        />
        <SecurityButton
          title="CHECK SCREEN MIRRORING"
          onPress={() =>
            handleSecurityCheck(
              Safeguard.checkScreenMirroring,
              'Screen Mirroring Check'
            )
          }
        />
        <SecurityButton
          title="CHECK APP SPOOFING"
          onPress={() =>
            handleSecurityCheck(
              Safeguard.checkApplicationSpoofing,
              'App Spoofing Check'
            )
          }
        />
        <SecurityButton
          title="CHECK KEY LOGGER DETECTION"
          onPress={() =>
            handleSecurityCheck(Safeguard.checkKeyLogger, 'Key Logger Check')
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#000000',
    padding: 16,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 24,
  },
  button: {
    backgroundColor: '#222222',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
