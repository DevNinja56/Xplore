import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import {
    View,
    Image,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ScrollView,
    FlatList,
    Keyboard,
    Alert,
    Modal,
    SafeAreaView,
    LayoutAnimation,
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import Fonts from '../constants/Fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import * as firebase from 'firebase';
import ActionSheet from 'react-native-actionsheet'
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner'
import { GiftedChat, Actions, LoadEarlier, InputToolbar } from 'react-native-gifted-chat';
import initialMessages from './chat/messages';
import { renderActions, renderComposer, renderSend, renderInputToolbar } from './chat/InputToolbar';
import {
    // renderAvatar,
    renderBubble,
    renderSystemMessage,
    renderMessage,
    renderMessageText,
    renderCustomView,
    renderMessageImage
} from './chat/MessageContainer';
import Menu, { MenuItem } from 'react-native-material-menu';
import moment from 'moment';
import Functions from '../constants/Functions';
import { CardItem } from './components/CardItem';
import { CompactItem } from './components/CompactItem';

class ChatScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            clients: [],
            loading: false,
            loadEarlier: true, 
            isLoadingEarlier: false, 
            typingText: '',
            blockStatus: [false, false],
            keyboardHeight: 20,
            conversation: {
                badge: 0,
                conversation_id: props.route.params.conversation.conversation_id,
                opponent_id: props.route.params.conversation.opponent_id,
                promise_id: props.route.params.conversation.promise_id,
                promise: props.route.params.conversation.promise,
                is_favorited: props.route.params.conversation.is_favorited,
                is_group: props.route.params.conversation.is_group,
                name: props.route.params.conversation.name,
                photo: props.route.params.conversation.photo,
                online_status: true,
                is_push_enabled: 1,
                push_token: '',
            },
            text: '',
            messages: [],
            messageLoaded: false,
        }
        this.opponentUserRef = null
        this.groupRef = null
        this.conversationRef = null
        this.typingRef = null
        this.messagesRef = null
        this.participantsRef = null
        this.participantRefs = []
        this.messageCountToLoad = 100
        this._isMounted = false
    }    
    componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => this.keyboardWillShow(e));
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidHide', (e) => this.keyboardDidHide(e));

        this.loadFirstMessages()
        this.observeOpponent()
    }
    componentWillUnmount() {
        if (this.opponentUserRef != null) {
            this.opponentUserRef.off()
        }
        if (this.typingRef != null) {
            this.typingRef.off()
        }
        if (this.messagesRef != null) {
            this.messagesRef.off()
        }
        if (this.conversationRef != null) {
            this.conversationRef.off()
        }        
        this._isMounted = false

        this.keyboardWillShowListener.remove()
        this.keyboardDidShowListener.remove()
    }
    keyboardWillShow(e) {
        let newSize = e.endCoordinates.height;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({keyboardHeight: newSize});
    }
    keyboardDidHide(e) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({keyboardHeight: 0});
    }
    observeOpponent = () => {
        this.opponentUserRef = firebase.database().ref().child('users').child(this.state.conversation.opponent_id)
        this.opponentUserRef.on('value', (snapshot) => {
            if(!snapshot.exists || snapshot.val() == null) { 
                return
            }
            this.loadBlockStatus(snapshot.val().user_id)
            this.setState(prevState => ({...prevState, conversation: {
                ...prevState.conversation,
                online_status: snapshot.val().online_status,
                user_id: snapshot.val().user_id,
                name: snapshot.val().name,
                photo: snapshot.val().photo,
                push_token: snapshot.val().push_token,
                is_push_enabled: 1,
            }}))
            // this.observeConversation()
        })
    }
    observeConversation = () => {
        this.conversationRef = firebase.database().ref().child('conversations').child(global.loggedInUser.uid).child(this.state.conversation.conversation_id).child('meta_data')
        this.conversationRef.on('value', (snapshot) => {
            if(!snapshot.exists || snapshot.val() == null) { return }
            if (snapshot.val().is_conversation_updated == true) {
                if (this.state.conversation.user_id != null) {
                    this.loadBlockStatus(this.state.conversation.user_id)
                    firebase.database().ref().child('conversations').child(global.loggedInUser.uid).child(this.state.conversation.conversation_id).child('meta_data').child('is_conversation_updated').set(false)
                } else {
                    
                }
            }
        })
    }
    loadBlockStatus(user_id_two) {
        
    }
    loadFirstMessages = () => {
        this.messagesRef = firebase.database().ref().child('conversations').child(global.loggedInUser.uid).child(this.state.conversation.conversation_id).child('messages')
        this.messagesRef.limitToLast(this.messageCountToLoad).once('value', (snapshot) => {
            if(!snapshot.exists || snapshot.val() == null) { 
                this.setState({messageLoaded: true, loadEarlier: false})
                this.observeMessageRemoved()
                this.observeMessageAdded()      
                this.observeMessageChanged()
                return 
            }
            let messages = []
            let messageCount = snapshot.numChildren()
            snapshot.forEach((child) => {
                firebase.database().ref().child('messages').child(child.key).once('value', (snapshot) => {
                    if(!snapshot.exists || snapshot.val() == null || this.indexOfMessage(snapshot.key) != -1) { return }
                    if(snapshot.val().is_information == 1) {
                        let message = {
                            _id: snapshot.key,
                            text: snapshot.val().text,
                            createdAt: new Date(snapshot.val().timestamp),
                            system: true
                        }
                        messages.push(message)
                        this.updateMessageStatus(message)
                    } else {
                        let sender = {
                            _id: snapshot.val().sender_id,
                        }                        
                        if (snapshot.val().sender_id == global.loggedInUser.uid) {
                            sender.name = global.loggedInUser.firstName
                            // sender.avatar = global.loggedInUser.photo.includes("https://") ? global.loggedInUser.photo : global.serverURL + '/dentalhive/uploads/' + global.loggedInUser.photo
                        } else {
                            sender.name = this.state.conversation.firstName
                            // sender.avatar = conversation.photo.includes("https://") ? conversation.photo : global.serverURL + '/dentalhive/uploads/' + conversation.photo
                        }
                        let message = {
                            _id: snapshot.key,
                            text: snapshot.val().text,
                            image: snapshot.val().image_url != '' ? global.serverURL + '/dentalhive/uploads/' + snapshot.val().image_url : '',
                            document: snapshot.val().document_url != '' ? snapshot.val().document_url : '',
                            createdAt: new Date(snapshot.val().timestamp),
                            user: sender,
                        }
                        messages.push(message)  
                        this.updateMessageStatus(message)
                    }                    
                    if(messages.length == messageCount) {
                        this.setState(prevState => ({
                            ...prevState, 
                            messageLoaded: true, 
                            messages: GiftedChat.prepend(prevState.messages, this.sortMessages(messages))
                        }))
                        this.observeMessageRemoved()        
                        this.observeMessageAdded()      
                        this.observeMessageChanged()

                        if (messageCount < this.messageCountToLoad) {
                            this.setState(prevState => ({...prevState, loadEarlier: false}))
                        }
                    }
                })
            })
        })
    }
    getFirstId = (currentUserId, conversation_id) => {
        let messagesRef = firebase.database().ref().child('conversations').child(currentUserId).child(conversation_id).child('messages')
        let numberOfMessagesToLoad = this.messageCountToLoad + this.state.messages.length
        messagesRef.limitToLast(numberOfMessagesToLoad).once('child_added', (snapshot) => {
            let firstId = snapshot.key
            this.getLastId(firstId, currentUserId, conversation_id)
        })
    }
    getLastId = (firstId, currentUserId, conversation_id) => {
        let messagesRef = firebase.database().ref().child('conversations').child(currentUserId).child(conversation_id).child('messages')
        let nextMessageIndex = this.state.messages.length + 1
        messagesRef.limitToLast(nextMessageIndex).once('child_added', (snapshot) => {
            let lastId = snapshot.key
            if(lastId != firstId) {
                this.getRangeMessages(firstId, lastId)
            } else {
                if (this.state.messages[this.state.messages.length - 1]._id == firstId) {
                    if (this._isMounted === true) {
                        this.setState(prevState => ({
                            ...prevState,
                            messages: GiftedChat.prepend(prevState.messages, []),
                            loadEarlier: false,
                            isLoadingEarlier: false
                        }))
                    }
                } else {
                    this.getRangeMessages(firstId, lastId)
                }
            }
        })
    }
    getRangeMessages = (firstId, lastId) => {
        if (this.messagesRef != undefined) {
            this.messagesRef.orderByKey().startAt(firstId).endAt(lastId).once('value', (snapshot) => {
                if(!snapshot.exists || snapshot.val() == null) { 
                    return 
                }
                let messages = []
                let messageCount = snapshot.numChildren()
                snapshot.forEach((child) => {
                    if(this.indexOfMessage(child.key) == -1) {
                        firebase.database().ref().child('messages').child(child.key).once('value', (snapshot) => {
                            if(!snapshot.exists || snapshot.val() == null) { return }
                            if(snapshot.val().is_information == 1) {
                                let message = {
                                    _id: snapshot.key,
                                    text: snapshot.val().text,
                                    createdAt: new Date(snapshot.val().timestamp),
                                    system: true
                                }
                                messages.push(message)
                                this.updateMessageStatus(message)
                            } else {
                                let sender = {
                                    _id: snapshot.val().sender_id,
                                    name: this.state.conversation.name,
                                    // avatar: conversation.photo.includes("https://") ? conversation.photo : global.serverURL + '/dentalhive/uploads/' + conversation.photo
                                }
                                let message = {
                                    _id: snapshot.key,
                                    text: snapshot.val().text,
                                    image: snapshot.val().image_url != '' ? global.serverURL + '/dentalhive/uploads/' + snapshot.val().image_url : '',
                                    document: snapshot.val().document_url != '' ? snapshot.val().document_url : '',
                                    createdAt: new Date(snapshot.val().timestamp),
                                    user: sender
                                }
                                messages.push(message)
                                this.updateMessageStatus(message)
                            }
                            if(messages.length == messageCount) {
                                if (this._isMounted === true) {
                                    this.setState(prevState => ({
                                        ...prevState, 
                                        messages: GiftedChat.prepend(previousState.messages, this.sortMessages(messages)), 
                                        loadEarlier: false, 
                                        isLoadingEarlier: false
                                    }))
                                }
                            }
                        })
                    }
                })
            })
        }        
    }
    sortMessages = (messages) => {
        return messages.sort(function(a, b) {
            if(a.createdAt > b.createdAt) { return -1 }
            if(a.createdAt < b.createdAt) { return 1 }
            return 0
        })
    }
    indexOfMessage(messageId) {
        let index = -1
        for(let i = 0; i < this.state.messages.length; i++) {
            if(this.state.messages[i]._id == messageId) {
                return i
            }
        }
        return index
    }
    observeMessageRemoved = () => {
        if (this.messagesRef != undefined) {
            this.messagesRef.on('child_removed', (snapshot) => {
                if(!snapshot.exists || snapshot.val() == null) { return }
                let messageIndex = this.indexOfMessage(snapshot.key)
                if(messageIndex != -1) {
                    this.setState(prevState => ({ 
                        ...prevState,
                        messages: prevState.messages.filter(message => message._id !== messages[messageIndex]._id) 
                    }))
                }
            })
        }
    }
    observeMessageAdded = () => {        
        this.messagesRef = firebase.database().ref().child('conversations').child(global.loggedInUser.uid).child(this.state.conversation.conversation_id).child('messages')
        this.messagesRef.limitToLast(this.messageCountToLoad).on('child_added', (snapshot) => {
            if(!snapshot.exists || snapshot.val() == null || this.indexOfMessage(snapshot.key) != -1) { return }
            firebase.database().ref().child('messages').child(snapshot.key).once('value', (snapshot) => {
                if(!snapshot.exists || snapshot.val() == null) { return }
                if(this.state.messages.length > 0) {
                    let firstMessageCreateAt = this.state.messages[0].createdAt
                    let messageCreateAt = new Date(snapshot.val().timestamp)
                    if(firstMessageCreateAt > messageCreateAt) {
                        return
                    }
                }
                if(snapshot.val().is_information == 1) {
                    let message = {
                        _id: snapshot.key,
                        text: snapshot.val().text,
                        createdAt: new Date(snapshot.val().timestamp),
                        system: true
                    }
                    if (!this.isMessageAlreadyAdded(snapshot.key)) {
                        this.updateMessageStatus(message)
                        this.setState(prevState => ({
                            ...prevState, 
                            messages: GiftedChat.append(prevState.messages, [message])
                        }))
                    } else {
                        console.log('Duplicated message')
                    }
                } else {
                    let sender = {
                        _id: snapshot.val().sender_id,
                    }
                    if (snapshot.val().sender_id == global.loggedInUser.uid) {
                        sender.name = global.loggedInUser.firstName
                        // sender.avatar = global.loggedInUser.photo.includes("https://") ? global.loggedInUser.photo : global.serverURL + '/dentalhive/uploads/' + global.loggedInUser.photo
                    } else {
                        sender.name = this.state.conversation.firstName
                        // sender.avatar = conversation.photo.includes("https://") ? conversation.photo : global.serverURL + '/dentalhive/uploads/' + conversation.photo
                    }
                    let message = {
                        _id: snapshot.key,
                        text: snapshot.val().text,
                        image: snapshot.val().image_url != '' ? global.serverURL + '/dentalhive/uploads/' + snapshot.val().image_url : '',
                        document: snapshot.val().document_url != undefined ? snapshot.val().document_url : '',
                        createdAt: new Date(snapshot.val().timestamp),
                        user: sender,
                    }
                    if (!this.isMessageAlreadyAdded(snapshot.key)) {
                        this.updateMessageStatus(message)
                        this.setState(prevState => ({
                            ...prevState, 
                            messages: GiftedChat.append(prevState.messages, [message])
                        }))
                    } else {
                        console.log('Duplicated message')
                    }
                }
            })
        })
    }
    observeMessageChanged = () => {
        // if (messagesRef != undefined) {
        //     messagesRef.on('child_changed', (snapshot) => {
        //         if(!snapshot.exists || snapshot.val() == null) { return }
        //         let messageIndex = indexOfMessage(snapshot.key)
        //         if(messageIndex != -1) {
        //             firebase.database().ref().child('messages').child(snapshot.key).once('value', (snapshot) => {
        //                 if(!snapshot.exists || snapshot.val() == null) { return }
        //                 if(snapshot.val().is_information == 1) {
        //                     let message = {
        //                         _id: snapshot.key,
        //                         text: snapshot.val().text,
        //                         createdAt: new Date(snapshot.val().timestamp),
        //                         system: true
        //                     }
        //                     let messages = messages
        //                     messages[messageIndex] = message
        //                     setMessages(messages)
        //                 } else {
        //                     let message = {
        //                         _id: snapshot.key,
        //                         text: snapshot.val().text,
        //                         image: snapshot.val().image_url != undefined ? snapshot.val().image_url : '',
        //                         document: snapshot.val().document_url != undefined ? snapshot.val().document_url : '',
        //                         contact: snapshot.val().contact_object != undefined ? snapshot.val().contact_object : undefined,
        //                         createdAt: new Date(snapshot.val().timestamp),
        //                         user: {
        //                             _id: snapshot.val().sender_id,
        //                         },
        //                     }
        //                     let messages = messages
        //                     messages[messageIndex] = message
        //                     setMessages(messages)
        //                 }
        //             })
        //         }
        //     })
        // }        
    }
    isMessageAlreadyAdded = (messageId) => {
        this.state.messages.forEach(message => {
            if (message._id == messageId) {
                return true
            }
        });
        return false
    }    
    resetBadgeForSelf = () => {
        let selfConversationMetaDataRef = firebase.database().ref().child('conversations').child(global.loggedInUser.uid).child(this.state.conversation.conversation_id).child('meta_data')
        selfConversationMetaDataRef.child('badge').transaction(badge => {
            badge = 0
            return badge
        })
    }
    updateMessageStatus = (message) => {
        let messageRef = firebase.database().ref().child('messages').child(message._id)
        messageRef.once('value', (snapshot) => {
            if(!snapshot.exists || snapshot.val() == null) { return }
            if(snapshot.val().seen == null) {
                let seen = {}
                seen[global.loggedInUser.uid] = 1
                messageRef.child('seen').set(seen)
            } else {
                let seen = snapshot.val().seen
                if(Object.keys(seen).indexOf(global.loggedInUser.uid) == -1) {
                    seen[global.loggedInUser.uid] = 1
                }
                messageRef.child('seen').set(seen)
            }
        })
        this.resetBadgeForSelf()
    }
    sendMessage = (text, image, document) => {
        const { conversation } = this.state        
        
        let pushTokens = []
        let pushMessage = ''        

        if(conversation.push_token != undefined && conversation.push_token != "" && parseInt(conversation.is_push_enabled) == 1) {
            pushTokens.push(conversation.push_token)
        }
        pushMessage = global.loggedInUser.firstName + ' sent you a message'

        if(text.length == 0 && image == '' && document == '') return       

        let messagesRef = firebase.database().ref().child('messages')
        let message = {
            sender_id: global.loggedInUser.uid,
            receiver_id: conversation.conversation_id,
            is_information: 0,
            seen: [],
            status: 'Delivered',
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            image_url: image,
            document_url: document,
            push_message: pushMessage,
            push_tokens: pushTokens,
        }
        let messageRef = messagesRef.push(message)
        let messageId = messageRef.key        

        let selfConversationMetaDataRef = firebase.database().ref().child('conversations').child(global.loggedInUser.uid).child(conversation.conversation_id).child('meta_data')
        selfConversationMetaDataRef.once('value', (snapshot) => {
            if(snapshot.exists && snapshot.val() != null) {
                selfConversationMetaDataRef.update({
                    last_message_id: messageId,                    
                }, function(error) {                    
                    if(!error) {
                        let selfConversationMessagesRef = firebase.database().ref().child('conversations').child(global.loggedInUser.uid).child(conversation.conversation_id).child('messages')
                        selfConversationMessagesRef.child(messageId).set(1)
                    }
                })
            } else {
                selfConversationMetaDataRef.set({
                    badge: 0,
                    conversation_id: conversation.conversation_id,
                    opponent_id: conversation.opponent_id,
                    promise_id: conversation.promise_id,
                    is_favorited: 0,
                    is_group: 0,
                    last_message_id: messageId,
                }, function(error) {
                    if(!error) {
                        let selfConversationMessagesRef = firebase.database().ref().child('conversations').child(global.loggedInUser.uid).child(conversation.conversation_id).child('messages')
                        selfConversationMessagesRef.child(messageId).set(1)     
                    } else {
                        console.log('Error 2')
                    }
                })
            }
        })
        let opponentConversationMetaDataRef = firebase.database().ref().child('conversations').child(conversation.opponent_id).child(conversation.promise_id + '_' + global.loggedInUser.uid).child('meta_data')
        opponentConversationMetaDataRef.once('value', (snapshot) => {
            if(snapshot.exists && snapshot.val() != null) {
                opponentConversationMetaDataRef.update({                    
                    last_message_id: messageId,
                }, function(error) {
                    if(!error) {
                        opponentConversationMetaDataRef.child('badge').transaction(badge => {
                            badge++
                            return badge
                        })
                        let opponentConversationMessagesRef = firebase.database().ref().child('conversations').child(conversation.opponent_id).child(conversation.promise_id + '_' + global.loggedInUser.uid).child('messages')
                        opponentConversationMessagesRef.child(messageId).set(1)
                    } else {
                        console.log('Error 3')
                    }
                })
            } else {
                opponentConversationMetaDataRef.set({
                    badge: 0,
                    conversation_id: conversation.promise_id + '_' + global.loggedInUser.uid,                    
                    opponent_id: global.loggedInUser.uid,
                    promise_id: conversation.promise_id,
                    is_favorited: 0,
                    is_group: 0,
                    last_message_id: messageId,
                }, function(error) {
                    if(!error) {
                        opponentConversationMetaDataRef.child('badge').transaction(badge => {
                            badge++
                            return badge
                        })
                        let opponentConversationMessagesRef = firebase.database().ref().child('conversations').child(conversation.opponent_id).child(conversation.promise_id + '_' + global.loggedInUser.uid).child('messages')
                        opponentConversationMessagesRef.child(messageId).set(1)
                    } else {
                        console.log('Error 4')
                    }
                })
            }                
        })
        this.sendNotifications(pushTokens, pushMessage)
        this.setState(prevState => ({
            ...prevState, 
            text: ''
        }))
    }
    sendNotifications = (pushTokens, message) => {
        // Functions.shared().sendPushNotification("New Message", message, pushTokens)
    }
    renderLoadEarlier = (props) => {
        if (this.state.messageLoaded) {
            return (
                <LoadEarlier
                    {...props}
                    containerStyle={{
                        backgroundColor: 'transparent',
                    }}
                    wrapperStyle={{
                        backgroundColor: 'rgba(0,0,0,0.05)',
                    }}
                    textStyle={{
                        color: 'rgba(0,0,0,0.5)',
                        paddingHorizontal: 5,
                        fontSize: 13,
                        fontFamily: Fonts.GothamCondensedBook
                    }}
                    label = {'Load More Messages'}
                    activityIndicatorColor={Colors.white}
                />
            )
        } else {
            return null
        }
    }
    renderAvatar = (props) => {
        return (
            <View style={{width: 15}}></View>
        )
    }
    renderFooter = () => {
        return (
            <View style={{flexDirection: 'column', justifyContent: 'flex-start'}}>
                <View style={{alignSelf: 'center', justifyContent: 'center'}}>
                </View>
            </View>
        )
    }
    onSend = (newMessages = []) => {
        this.sendMessage(this.state.text, '', '', null)
    }
    onLoadEarlier = () => {
        this.getFirstId(global.loggedInUser.uid, this.state.conversation.conversation_id)
    }
    onPressAvatar = (props) => {
        
    }
    onPressActionButton = (props) => {
    }    
    render() { 
        return (
            <View style={{flex: 1, width: Layouts.screenWidth, backgroundColor: global.userType == 'Employee' ? '#aa64afa9' : '#f8ba14a9'}}>
                <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
                <DisplayLoadingSpinner visible={this.state.loading} message={'Processing...'}/>
                <View style={{width: Layouts.screenWidth, height: Layouts.screenHeight / 2, position: 'absolute', bottom: 0, backgroundColor: Colors.white}} />
                <View style={{flex: 1, backgroundColor: Colors.white}} >
                    <View style={{flexDirection: 'row', paddingTop: this.props.route.params.insets.top, height: 44 + this.props.route.params.insets.top, width: Layouts.screenWidth, backgroundColor: Colors.background, alignItems: 'center'}}>
                        <View style={{flexDirection: 'row', height: 44, width: Layouts.screenWidth, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center'}}>
                            <TouchableOpacity onPress={() => this.props.navigation.pop()} style={{position: 'absolute', left: 10, width: 32, height: 32, justifyContent: 'center'}}>
                                <Image resizeMode={'contain'} source={require('../assets/images/icon_back.png')} style={{width: 20, height: 20, tintColor: Colors.primaryColor}} />
                            </TouchableOpacity>
                            <Text style={{position: 'absolute', fontSize: 16, color: Colors.white, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                                {'CHAT WITH ' + this.props.route.params.conversation.name.toUpperCase()}
                            </Text>
                            <TouchableOpacity onPress={() => {

                            }} style={{position: 'absolute', right: 10, width: 32, height: 32, justifyContent: 'center'}}>
                                <Image resizeMode={'contain'} source={require('../assets/images/icon_phone.png')} style={{width: 24, height: 24, tintColor: Colors.primaryColor, resizeMode: 'contain'}} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{backgroundColor: Colors.background, width: Layouts.screenWidth, paddingBottom: 20, paddingTop: 10}}>
                        <CompactItem 
                            promise={this.props.route.params.conversation.promise}  
                            index={0}
                            isVisibleMessage={false}
                            onMessageClicked={(promise) => {
                                
                            }}
                            onUserClicked={(userId) => {
                                if (global.loggedInUser.id != userId) {
                                    this.props.navigation.push('HeadToHead', {userId: userId})
                                }
                            }}
                        />
                    </View>
                    <View style={{marginTop: 0, flex: 1, width: Layouts.screenWidth, paddingTop: 0, paddingBottom: 10, backgroundColor: Colors.white, borderTopStartRadius: 30, borderTopEndRadius: 30}}>
                        <GiftedChat
                            ref={'giftedChat'}
                            messages={this.state.messages}
                            text={this.state.text}
                            onInputTextChanged={(val) => 
                                this.setState(prevState => ({
                                    ...prevState, text: val
                                }))
                            }
                            onSend={messages => this.onSend(messages)}
                            showsVerticalScrollIndicator={false}
                            user={{
                                _id: global.loggedInUser.uid,
                            }}
                            show
                            // alignTop
                            alwaysShowSend
                            scrollToBottom={true}
                            scrollToBottomComponent={() => 
                                <Image source={require('../assets/images/icon_input_dropdown.png')} style={{resizeMode: 'contain', width: 16, height: 16, tintColor: global.userType == 'Employee' ? Colors.primary : Colors.secondary}} />
                            }
                            multiline={false}
                            infiniteScroll
                            onLoadEarlier={this.onLoadEarlier}
                            showUserAvatar
                            loadEarlier={this.state.loadEarlier}
                            renderLoadEarlier={this.renderLoadEarlier}
                            showAvatarForEveryMessage
                            renderAvatarOnTop

                            onPressAvatar={this.onPressAvatar}
                            onPressActionButton={this.onPressActionButton}
                            renderInputToolbar={renderInputToolbar}
                            renderActions={renderActions}
                            renderComposer={renderComposer}
                            renderSend={renderSend}
                            renderAvatar={this.renderAvatar}
                            renderBubble={renderBubble}
                            renderSystemMessage={renderSystemMessage}
                            renderMessage={renderMessage}
                            renderMessageText={renderMessageText}
                            renderMessageImage={renderMessageImage}
                            renderCustomView={renderCustomView}
                            onContactClicked={(userId) => {
                                // navigation.push('ProfileFriend', {user_id: userId})
                            }}
                            onDeclineSchedule={(message) => {
                                this.decineSchedule(message)
                            }}
                            onAcceptSchedule={(message) => {
                                this.acceptSchedule(message)
                            }}
                            onCancelSchedule={(message) => {
                                this.cancelSchedule(message)
                            }}
                            onEditSchedule={(message) => {
                                this.onEditScheduleClicked(message)
                            }}
                            onScheduleClicked={(message) => {
                                this.onScheduleClicked(message)
                            }}
                            renderChatEmpty={() => 
                                <View style={{alignItems: 'center', flex: 1, paddingTop: 35, transform: [{scaleY: -1}]}}>
                                    <Text style={{fontFamily: Fonts.GothamMedium, textAlign: 'center', fontSize: 16, color: Colors.gray_light}}>{"NO MESSAGES FOUND"}</Text>
                                </View>
                            }
                            maxComposerHeight={120}
                            // isCustomViewBottom
                            bottomOffset={10}
                            renderChatFooter={(this.state.typingText != '' || this.state.messages.length == 0) ? this.renderFooter : null}
                            messagesContainerStyle={{ paddingTop: 0, paddingBottom: 25, marginHorizontal: 0 }}
                            lightboxProps={{ springConfig: { tension: 90000, friction: 90000 } }}
                            parsePatterns={(linkStyle) => [
                                {
                                    pattern: /#(\w+)/,
                                    style: linkStyle,
                                    onPress: (tag) => console.log(`Pressed on hashtag: ${tag}`),
                                },
                            ]}
                        />
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    textInputContainer: {
        width: Layouts.screenWidth - 60, 
        height: 54, 
        paddingStart: 0,
        paddingEnd: 0, 
        borderRadius: 16, 
        borderWidth: 1,
        backgroundColor: Colors.white,
        shadowColor: "#000", 
        shadowOffset: { 
            width: 0,
            height: 2,
        }, 
        shadowOpacity: 0.03, 
        shadowRadius: 3.84, 
        elevation: 2,
        justifyContent: 'flex-end', 
        flexDirection: 'row', 
        alignItems: 'center',
    },
    textInput: {
        flex: 1, 
        height: 40,
        color: Colors.black, 
        fontSize: 16, 
        fontFamily: Fonts.GothamCondensedBook
    },
    textView: {
        flex: 1, 
        color: Colors.black, 
        fontSize: 16, 
        fontFamily: Fonts.GothamCondensedBook
    },
    lookingForButton: {
        width: 100, 
        height: 48, 
        borderRadius: 24, 
        borderWidth: 1, 
        borderColor: Colors.primary, 
        backgroundColor: 'transparent', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    signUpButton: {
        width: Layouts.screenWidth - 60, 
        height: 60, 
        borderRadius: 30, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: "#000", 
        shadowOffset: { 
            width: 0,
            height: 2,
        }, 
        shadowOpacity: 0.1, 
        shadowRadius: 3.84, 
        elevation: 3,
    },
    weekdayCheckbox: {
        width: 24, 
        height: 24, 
        borderRadius: 5, 
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: Colors.primary, 
        justifyContent: 'center', 
        alignItems: 'center'
    }, applyTextInputContainer: {
        width: Layouts.screenWidth - 100,
        height: 64,
        borderRadius: 8,
        borderColor: '#E9E9E9',
        borderWidth: 1,
        color: Colors.black, 
        fontSize: 16, 
        fontFamily: Fonts.GothamCondensedMedium,
        paddingStart: 20,
        paddingEnd: 15,
        justifyContent: 'center',
    }, applyTextInput: {
        color: Colors.black, 
        height: 44,
        fontSize: 16, 
        fontFamily: Fonts.GothamCondensedMedium,
    }, applyButton: {
        width: Layouts.screenWidth - 60, 
        height: 60, 
        borderRadius: 30, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: "#000", 
        shadowOffset: { 
            width: 0,
            height: 2,
        }, 
        shadowOpacity: 0.1, 
        shadowRadius: 3.84, 
        elevation: 3,
        backgroundColor: Colors.primary
    }
});

export default ChatScreen;