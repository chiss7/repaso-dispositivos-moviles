import { Button, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Reemplaza con tu clave de API de Gemini
const API_KEY = "AIzaSyDpOWbNh22z8lRIM0RDPgiayv48tAyBxjc";
const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface FileData {
  uri: string;
  name: string;
  type: string;
  content?: string | object;
}

const Chat = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [extractedContent, setExtractedContent] = useState<string>('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const extractPdfFromBackend = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const response = await fetch("http://192.168.100.14:3000/api/extract-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64 }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.text;  
    } catch (error) {
      console.error("Error al extraer PDF:", error);
    }
  };

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
          content = await extractPdfFromBackend(fileData.uri);
          console.log(content);
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

  // Enviar mensaje y obtener respuesta de Gemini
  const sendMessage = async () => {
    if (!input.trim() && !extractContent) return;

    const userPrompt = extractedContent
      ? `${input.trim()}\n\nContenido extraído del archivo:\n${extractedContent}`
      : input;
    
    const userText = extractedContent
      ? `${input.trim()} Archivo: ${file?.name}`
      : input;

    const userMessage: Message = { id: Date.now(), text: userText, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(userPrompt);
      const response = result.response.text();

      const botMessage: Message = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error con Gemini API:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Error al conectar con la API",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setFile(null); // Opcional: limpiar el archivo tras enviarlo
      setExtractedContent(""); // Opcional: limpiar el contenido extraído
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-100"
    >
      <View className="flex-1">
        {/* Área de mensajes */}
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`p-3 my-2 rounded-lg max-w-[80%] ${msg.isUser ? "bg-blue-500 self-end" : "bg-gray-300 self-start"}`}
            >
              <Text
                className={`text-base ${msg.isUser ? "text-white" : "text-blue"}`}
              >
                {msg.text}
              </Text>
            </View>
          ))}
          {loading && (
            <Text className="text-gray-500 text-center">Cargando...</Text>
          )}
        </ScrollView>

        {/* Área de entrada */}
        <View className="flex-row p-4 border-t border-gray-300 bg-white">
          <TextInput
            className="flex-1 p-2 mr-2 border border-gray-400 rounded-lg"
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje..."
            editable={!loading}
          />
          <Button title={`${extractedContent ? "Subido" : "Subir"}`} onPress={pickFile} disabled={loading} />
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg"
            onPress={sendMessage}
            disabled={loading}
          >
            <Text className="text-white font-bold">Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default Chat