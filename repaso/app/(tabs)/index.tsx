import { StyleSheet, Platform, View, Text, Button, ScrollView, Image, Pressable } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useRef, useState } from 'react';
import SplashScreenView from '@/components/SplashScreenView';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import FastImage from 'react-native-fast-image';
import { Video, ResizeMode } from "expo-av";
import { Link, useRouter } from 'expo-router';
//var xml2js = require('xml2js');


interface FileData {
  uri: string;
  name: string;
  type: string;
  content?: string | object;
}

export default function HomeScreen() {

  const [text, setText] = useState('');
  const [pdf, setPdf] = useState(null);
  const [file, setFile] = useState<FileData | null>(null);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [response, setResponse] = useState<string>('');

  const videoRef = useRef<Video>(null);

  const router = useRouter();

  const [visible, setVisible] = useState(false);
  /* useEffect(() => {
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  }, []) */

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain', 'application/xml', 'application/json'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0];
      const fileData: FileData = {
        uri: selected.uri,
        name: selected.name,
        type: selected.mimeType || '',
      };
      setFile(fileData);
      extractContent(fileData);
    } else {
      setExtractedContent('Selección cancelada');
    }
  };

  const extractContent = async (fileData: FileData) => {
    try {
      let content: string | object;

      switch (fileData.type) {
        case 'application/pdf':
          // Por ahora, solo indicamos que no se puede procesar localmente
          content = 'Extracción de PDF no soportada localmente en esta versión. Sube a un servidor para procesarlo.';
          break;
        case 'text/plain':
          content = await FileSystem.readAsStringAsync(fileData.uri);
          break;
        case 'application/json':
          const jsonContent = await FileSystem.readAsStringAsync(fileData.uri);
          content = JSON.parse(jsonContent);
          break;
        default:
          content = 'Formato no soportado';
      }

      setFile({ ...fileData, content });
      setExtractedContent(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    } catch (error) {
      setExtractedContent(`Error al extraer contenido: ${error}`);
    }
  };

  return (
    visible ? <SplashScreenView /> :
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <View>

      <Button title="Subir archivo" onPress={pickFile} />
      {file && <Text className='text-white'>Archivo: {file.name} ({file.type})</Text>}
      {extractedContent ? 
         <ScrollView>
          <Text className='text-white'>{extractedContent}</Text>
         </ScrollView>
      : null}

      <Video
        ref={videoRef}
        source={require('@/assets/images/video-test.mp4')} // Ejemplo de video MP4
        style={{ width: 300, height: 300 }}
        //className="w-64 h-36 self-center mb-6" // Tamaño ajustado
        useNativeControls // Muestra controles nativos (play, pausa, etc.)
        resizeMode={ResizeMode.CONTAIN} // Equivalente a contentFit="contain"
        isLooping // Repite el video automáticamente
        onError={(e) => console.log("Error cargando video:", e)}
        onLoad={() => console.log("Video cargado correctamente")}
      />

      <Link className='text-white' href="https://docs.expo.dev/versions/latest/sdk/av/" >asd</Link>
      
      <Pressable onPress={() => router.push({
        pathname: '/chart',
        params: { data: 'Hola' }
      })}>
        <Text className='text-white pt-8'>Pressable</Text>
      </Pressable>

      </View>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12'
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
