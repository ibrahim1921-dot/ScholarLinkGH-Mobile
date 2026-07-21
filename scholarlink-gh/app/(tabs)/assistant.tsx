import { useState, useRef, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert, StyleSheet, Text, View, TextInput, ScrollView, Pressable, Platform, KeyboardAvoidingView, ActivityIndicator, Image, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { aiService } from "../../services/aiService";
import { useAuth } from "../../hooks/useAuth";
import { UserAvatar } from "../../components/UserAvatar";

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  action?: 'review_mode' | null;
}

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${user?.username?.split(' ')[0] || 'there'}! I'm your scholarship coach. I can help you find Ghanaian scholarship opportunities or review your application essays. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const addMessage = (text: string, sender: 'ai' | 'user', action?: 'review_mode' | null) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userText = inputText.trim();
    addMessage(userText, 'user');
    setInputText("");
    setLoading(true);

    try {
      if (reviewMode) {
        setReviewMode(false);
        const result = await aiService.reviewEssay(userText);
        const replyText = typeof result === "string" ? result : JSON.stringify(result, null, 2);
        addMessage(`Here is my review:\n\n${replyText}`, 'ai');
      } else {
        // Fallback generic response if not in review mode
        // Or we could pass it to checkOriginality just for fun
        addMessage("I am currently specialized in reviewing essays, generating personal statements, and building CVs. Try choosing one of the suggested prompts below!", 'ai');
      }
    } catch (e: any) {
      addMessage(`Error: ${e?.message ?? "Something went wrong."}`, 'ai');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePs = async () => {
    addMessage("Generate a personal statement for me.", 'user');
    setLoading(true);
    try {
      const ps = await aiService.generatePersonalStatement();
      addMessage(`Here is a drafted personal statement:\n\n${ps}`, 'ai');
    } catch (e: any) {
      addMessage(`Failed to generate: ${e?.message ?? "Unknown error."}`, 'ai');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCv = async () => {
    addMessage("Generate my CV.", 'user');
    setLoading(true);
    try {
      const cv = await aiService.generateCv();
      addMessage(`Here is your generated CV:\n\n${cv}`, 'ai');
    } catch (e: any) {
      addMessage(`Failed to generate: ${e?.message ?? "Unknown error."}`, 'ai');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewPrompt = () => {
    addMessage("I would like you to review my essay.", 'user');
    setReviewMode(true);
    setTimeout(() => {
      addMessage("Sure! Please paste your essay text below, and I will review it for you.", 'ai', 'review_mode');
    }, 500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Top App Bar */}
      <ImageBackground
        source={require("../../assets/images/header-assistant.jpg")}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary, opacity: 0.65 }]} />
        <View style={styles.headerLeft}>
          <Pressable style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={[styles.headerTitle, { color: '#ffffff' }]}>AI Coach</Text>
        </View>
        <View style={styles.statusBox}>
          <View style={styles.botIconSmall}>
            <Ionicons name="hardware-chip" size={14} color="#1b6d24" />
          </View>
          <Text style={[styles.statusText, { color: '#a0f399' }]}>Online</Text>
        </View>
      </ImageBackground>

      {/* Main Chat Canvas */}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatCanvas}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[
            styles.messageWrapper, 
            msg.sender === 'user' ? styles.messageWrapperUser : styles.messageWrapperAi
          ]}>
            {msg.sender === 'ai' && (
              <View style={styles.botAvatar}>
                <Ionicons name="hardware-chip" size={16} color="#1b6d24" />
              </View>
            )}
            
            <View style={[
              styles.bubble,
              msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAi
            ]}>
              <Text style={[
                styles.bubbleText,
                msg.sender === 'user' ? styles.bubbleTextUser : styles.bubbleTextAi
              ]}>{msg.text}</Text>
              <Text style={[
                styles.timeText,
                msg.sender === 'user' ? styles.timeTextUser : styles.timeTextAi
              ]}>{msg.time}</Text>
            </View>

            {msg.sender === 'user' && (
              <UserAvatar size={32} style={styles.userAvatar} />
            )}
          </View>
        ))}

        {loading && (
          <View style={[styles.messageWrapper, styles.messageWrapperAi]}>
            <View style={styles.botAvatar}>
              <Ionicons name="hardware-chip" size={16} color="#1b6d24" />
            </View>
            <View style={[styles.bubble, styles.bubbleAi, { paddingVertical: 12 }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Interaction Area */}
      <View style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom + 90, 100) }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
          <Pressable style={styles.promptBtn} onPress={handleGeneratePs} disabled={loading}>
            <Text style={styles.promptBtnText}>Generate personal statement</Text>
          </Pressable>
          <Pressable style={styles.promptBtn} onPress={handleReviewPrompt} disabled={loading}>
            <Text style={styles.promptBtnText}>Review my essay</Text>
          </Pressable>
          <Pressable style={styles.promptBtn} onPress={handleGenerateCv} disabled={loading}>
            <Text style={styles.promptBtnText}>Generate CV</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.inputContainer}>
          <Pressable style={styles.attachBtn}>
            <Ionicons name="attach" size={24} color={colors.muted} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder={reviewMode ? "Paste your essay here..." : "Type a message..."}
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={reviewMode ? 10000 : 1000}
          />
          <Pressable style={styles.sendBtn} onPress={handleSend} disabled={loading || !inputText.trim()}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={18} color="#ffffff" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
        paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195, 198, 209, 0.3)',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: colors.primary,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a0f399', // secondary-container
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: '#1b6d24', // secondary
  },
  chatCanvas: {
    padding: 20,
    paddingBottom: 20,
    gap: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    maxWidth: '85%',
  },
  messageWrapperAi: {
    alignSelf: 'flex-start',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a0f399', // secondary-container
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#003366', // primary-container
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  bubbleAi: {
    backgroundColor: '#ffffff', // surface-container-lowest
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.3)',
  },
  bubbleUser: {
    backgroundColor: '#001e40', // primary
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  bubbleTextAi: {
    color: colors.ink, // on-surface
  },
  bubbleTextUser: {
    color: '#ffffff', // on-primary
  },
  timeText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 10,
    marginTop: 8,
  },
  timeTextAi: {
    color: colors.muted, // outline
    opacity: 0.6,
  },
  timeTextUser: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  bottomArea: {
    backgroundColor: 'rgba(249, 249, 254, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(195, 198, 209, 0.2)',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  promptsScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  promptBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.5)',
  },
  promptBtnText: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    fontSize: 12,
    color: '#43474f', // on-surface-variant
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e8ed', // surface-container-high
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'BeVietnamPro_400Regular',
    fontSize: 14,
    color: colors.ink,
    minHeight: 40,
    maxHeight: 100,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#001e40', // primary
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
