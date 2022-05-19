import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    View,
    Image,
    Platform,
    StatusBar,
    ImageBackground,
    TouchableOpacity,
    Text,
    FlatList,
    SafeAreaView,
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from "react-native-linear-gradient";
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';
import axios from 'axios'
import Fonts from '../constants/Fonts';
import Functions from '../constants/Functions';
import moment from 'moment';
import { CompactItem } from './components/CompactItem';
import { GiftedChat } from 'react-native-gifted-chat';
import initialMessages from './messages';
import { renderInputToolbar, renderActions, renderComposer, renderSend } from './InputToolbar';
import {
  renderAvatar,
  renderBubble,
  renderSystemMessage,
  renderMessage,
  renderMessageText,
  renderCustomView,
} from './MessageContainer';

function ChatScreenOld({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        activities: [],
        refreshing: false,
    })
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const opponent = route.params.promise.userIdFrom == global.loggedInUser.id ? route.params.promise.userTo : route.params.promise.userFrom
    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: Colors.background,
                height: 44 + insets.top,
                shadowOpacity: 0,
                borderBottomWidth: 0,
                elevation: 0,
            },
            headerTitle: props => (
                <Text style={{fontSize: 16, color: Colors.white, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                    {'CHAT WITH ' + opponent.firstName.toUpperCase()}
                </Text>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.pop()} style={{marginLeft: 10, width: 32, height: 32, justifyContent: 'center'}}>
                    <Image resizeMode={'contain'} source={require('../assets/images/icon_back.png')} style={{width: 20, height: 20, tintColor: Colors.primaryColor}} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.pop()} style={{marginLeft: 10, width: 32, height: 32, justifyContent: 'center'}}>
                    <Image resizeMode={'contain'} source={require('../assets/images/icon_phone.png')} style={{width: 24, height: 24, tintColor: Colors.primaryColor, resizeMode: 'contain'}} />
                </TouchableOpacity>
            )
        })
    })
    useEffect(() => {
        setMessages(initialMessages.reverse());
        return () => {};
    }, []);    
    const onSend = async (newMessages = []) => {
        setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Loading...'}/>
            <SafeAreaView style={{flex: 1, alignItems: 'center', backgroundColor: Colors.white}} >
                <View style={{paddingTop: 10, paddingBottom: 20, backgroundColor: Colors.background}}>
                    <CompactItem 
                        promise={route.params.promise}  
                        index={0}
                        onMessageClicked={(promise) => {
                            
                        }}
                        isVisibleMessage={false}
                        onUserClicked={(userId) => {
                            if (global.loggedInUser.id != userId) {
                                navigation.push('HeadToHead', {userId: userId})
                            }
                        }}
                        onPromiseClicked={(index, loadType) => {
                            navigation.push('Promises', {index: index, loadType: 'OPEN_MADE_BY_ME', category: state.category})
                        }}
                    />
                </View>
                <GiftedChat
                    messages={messages}
                    text={text}
                    onInputTextChanged={setText}
                    onSend={onSend}
                    user={{
                        _id: 1,
                        name: global.loggedInUser.username,
                        avatar: global.loggedInUser.photo,
                    }}
                    alignTop
                    alwaysShowSend
                    scrollToBottom
                    scrollToBottomComponent={() => 
                        <Image source={require('../assets/images/icon_down_new.png')} style={{resizeMode: 'contain', width: 16, height: 16, tintColor: Colors.gray}} />
                    }
                    showUserAvatar
                    showAvatarForEveryMessage
                    renderAvatarOnTop
                    renderUsernameOnMessage={false}
                    multiline={true}
                    bottomOffset={26 - 8.5}
                    onPressAvatar={console.log}
                    renderInputToolbar={renderInputToolbar}
                    // renderActions={renderActions}
                    renderComposer={renderComposer}
                    renderSend={renderSend}
                    renderAvatar={renderAvatar}
                    renderBubble={renderBubble}
                    renderSystemMessage={renderSystemMessage}
                    renderMessage={renderMessage}
                    renderMessageText={renderMessageText}
                    // renderMessageImage
                    // renderCustomView={renderCustomView}
                    minComposerHeight={44}
                    maxComposerHeight={100}
                    minInputToolbarHeight={44}
                    maxInputLength={255}
                    isCustomViewBottom
                    messagesContainerStyle={{ backgroundColor: Colors.white, paddingHorizontal: 0, width: Layouts.screenWidth - 0, paddingBottom: 15 }}
                    parsePatterns={(linkStyle) => [
                        {
                            pattern: /#(\w+)/,
                            style: linkStyle,
                            onPress: (tag) => console.log(`Pressed on hashtag: ${tag}`),
                        },
                    ]}
                    renderChatEmpty={() => 
                        <View style={{paddingTop: 35, alignItems: 'center', transform: [{ rotate: '-180deg' }, { scaleX: -1 }]}}>
                            {/* <TouchableOpacity onPressIn={() => {
                                
                            }} style={{width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: Colors.lighgrayColor, justifyContent: 'center', alignItems: 'center'}}>
                                <Image source={require('../assets/images/icon_refresh.png')} style={{tintColor: Colors.lighgrayColor, width: 18, height: 18}} />
                            </TouchableOpacity> */}
                            <Text style={{marginTop: 10, color: Colors.white, fontFamily: 'SFUIDisplay-Regular', fontSize: 16}}>{'No messages yet'}</Text>
                        </View>
                    }
                />
                <View style={{width: Layouts.screenWidth, height: insets.bottom, backgroundColor: Colors.white, position: 'absolute', bottom: 0}} />
            </SafeAreaView>
        </View>
    )
}

export default ChatScreenOld;