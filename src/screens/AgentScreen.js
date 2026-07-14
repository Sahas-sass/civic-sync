import React, { useState, useRef, useEffect } from 'react';
import { 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  Keyboard
} from 'react-native';
import { supabase } from '../services/supabaseClient';
import { BACKEND_URL } from '../services/apiConfig';
import MessageItem from '../components/MessageItem';
import ChatInput from '../components/ChatInput';
import AgentStatus from '../components/AgentStatus';

const KeyboardContainer = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

export default function AgentScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [agentStatus, setAgentStatus] = useState(null); // Tracks the multi-step reasoning
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    fetchChatHistory();

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    if (keyboardVisible) {
      parent.setOptions({
        tabBarStyle: { display: 'none' }
      });
    } else {
      parent.setOptions({
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          height: 70,
          shadowColor: '#1E3A8A',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
        }
      });
    }

    return () => {
      parent.setOptions({
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          height: 70,
          shadowColor: '#1E3A8A',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
        }
      });
    };
  }, [keyboardVisible, navigation]);

  const fetchChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ChatMessages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([
          {
            id: 'default-greeting',
            sender: 'ai',
            text: 'Hello! I am your Civic AI. How can I help you navigate government processes today?',
            type: 'message'
          }
        ]);
      }
    } catch (error) {
      console.log('Error loading chat history:', error.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const userText = inputText.trim();
    setInputText('');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      const userMsgId = Date.now().toString();
      const userMsg = { id: userMsgId, sender: 'user', text: userText, type: 'message' };
      setMessages((prev) => [...prev, userMsg]);

      const { error: saveUserErr } = await supabase
        .from('ChatMessages')
        .insert({
          user_id: user.id,
          sender: 'user',
          text: userText
        });
      if (saveUserErr) console.log('Error saving user message:', saveUserErr.message);

      setAgentStatus('Searching legal database...');

      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_text: userText,
          user_id: user.id
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const json = await response.json();
      const aiReplyText = json.chat_reply || 'I could not process a response.';

      setAgentStatus(null);

      const { error: saveAiErr } = await supabase
        .from('ChatMessages')
        .insert({
          user_id: user.id,
          sender: 'ai',
          text: aiReplyText
        });
      if (saveAiErr) console.log('Error saving AI response:', saveAiErr.message);

      const aiMsg = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiReplyText, type: 'message' };
      setMessages((prev) => [...prev, aiMsg]);

      if (json.roadmap_trigger) {
        setAgentStatus('Generating interactive roadmap...');
        const { error: rpcError } = await supabase.rpc('create_roadmap_from_json', {
          p_user_id: user.id,
          p_title: json.roadmap_trigger.title,
          p_description: json.roadmap_trigger.description,
          p_steps: json.roadmap_trigger.steps
        });
        setAgentStatus(null);
        if (rpcError) {
          console.log('Error calling create_roadmap_from_json RPC:', rpcError.message);
        } else {
          Alert.alert('New Checklist Generated', `A personalized roadmap: "${json.roadmap_trigger.title}" has been created for you! Check it in the Roadmaps tab.`);
        }
      }

    } catch (error) {
      setAgentStatus(null);
      console.log('Chat API Error:', error.message);
      
      const errMsg = {
        id: (Date.now() + 2).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting to the civic database right now. Please try again in a moment.",
        type: 'message'
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const renderItem = ({ item }) => {
    return <MessageItem item={item} />;
  };

  if (loadingHistory) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text className="text-sm text-textLight mt-3">Loading conversation history...</Text>
      </View>
    );
  }

  return (
    <KeyboardContainer 
      className="flex-1 bg-background" 
      {...(Platform.OS === 'ios' ? {
        behavior: 'padding',
        keyboardVerticalOffset: 0
      } : {})}
    >
      {/* Header */}
      <View 
        className="bg-white pb-4 items-center border-b border-[#E2E8F0] shadow-sm"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 30 }}
      >
        <Text className="text-lg font-bold text-primaryBlue">CivicSync AI</Text>
        <Text className="text-xs text-textLight mt-0.5">Legal Navigator Assistant</Text>
      </View>

      {/* Chat History */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Multi-Step Agent Status Indicator */}
      <AgentStatus status={agentStatus} />

      {/* Input Area */}
      <ChatInput 
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        keyboardVisible={keyboardVisible}
      />
    </KeyboardContainer>
  );
}