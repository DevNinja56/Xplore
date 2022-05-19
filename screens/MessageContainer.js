/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { View, Text } from 'react-native';
import { Avatar, Bubble, SystemMessage, Message, MessageText } from 'react-native-gifted-chat';
import Colors from '../constants/Colors';
import moment from 'moment';
import Fonts from '../constants/Fonts';

export const renderAvatar = (props) => {
    return (
        null
        // <Avatar
        //     {...props}
        //     containerStyle={{ left: { borderWidth: 3, borderColor: 'red' }, right: {} }}
        //     imageStyle={{ left: { borderWidth: 3, borderColor: 'blue' }, right: {} }}
        // />
    )
}

export const renderBubble = (props) => {
    return (
        <Bubble
            {...props}
            renderTime={() => 
                <Text style={{color: props.currentMessage.user._id == 1 ? Colors.white : Colors.text, fontFamily: Fonts.GothamMedium, fontSize: 10, marginStart: 0}}>
                    {moment(props.currentMessage.createdAt).format('h:mm A')}
                </Text>
            }
            // renderTicks={() => <Text>Ticks</Text>}
            // renderUsername={() => <Text></Text>}
            containerStyle={{
                left: { backgroundColor: 'transparent', borderColor: 'teal', borderWidth: 0 },
                right: { backgroundColor: 'transparent', borderColor: 'red', borderWidth: 0 },
            }}
            wrapperStyle={{
                left: { backgroundColor: '#e5e5e5', borderWidth: 0, overflow: 'hidden', paddingHorizontal: 15, paddingVertical: 7, borderRadius: 25 },
                right: { backgroundColor: Colors.blue, borderWidth: 0, overflow: 'hidden', paddingHorizontal: 15, paddingVertical: 7, borderRadius: 25 },
            }}
            bottomContainerStyle={{
                left: { borderColor: 'purple', borderWidth: 0 },
                right: { borderColor: 'red', borderWidth: 0 },
            }}
            tickStyle={{}}
            usernameStyle={{ color: 'tomato', fontWeight: '100' }}
            containerToNextStyle={{
                left: { borderColor: 'navy', borderWidth: 0 },
                right: { borderColor: 'red', borderWidth: 0 },
            }}
            containerToPreviousStyle={{
                left: { borderColor: 'mediumorchid', borderWidth: 0 },
                right: { borderColor: 'red', borderWidth: 0 },
            }}
        />
    )
}

export const renderSystemMessage = (props) => (
    <SystemMessage
        {...props}
        containerStyle={{ backgroundColor: 'transparent' }}
        wrapperStyle={{ borderWidth: 10, borderColor: 'transparent' }}
        textStyle={{ color: Colors.text_light, fontFamily: Fonts.GothamMedium, fontSize: 12 }}
    />
);

export const renderMessage = (props) => {    
    return (
        <Message
            {...props}
            renderDay={() => 
                <Text style={{alignSelf: 'center', fontFamily: Fonts.GothamMedium, color: Colors.text_light, fontSize: 12, paddingVertical: 10}}>
                    {moment(props.currentMessage.createdAt).format('MMM D, YYYY')}
                </Text>
            }
            containerStyle={{
                left: { backgroundColor: 'transparent' },
                right: { backgroundColor: 'transparent' },
            }}
        />
    )
}

export const renderMessageText = (props) => (
    <MessageText
        {...props}
        containerStyle={{
            left: { },
            right: { },
        }}
        textStyle={{
            left: { marginStart: 0, marginEnd: 0, color: Colors.text, fontFamily: Fonts.GothamMedium, fontSize: 14 },
            right: { marginStart: 0, marginEnd: 0, color: 'white', fontFamily: Fonts.GothamMedium, fontSize: 14 },
        }}
        linkStyle={{
            left: { color: 'blue' },
            right: { color: 'blue' },
        }}
        customTextStyle={{ marginStart: 0, marginEnd: 0, fontFamily: Fonts.GothamMedium, fontSize: 14 }}
    />
);

export const renderCustomView = ({ user }) => (
    <View style={{ minHeight: 20, alignItems: 'center' }}>
        <Text>
        Current user:
        {user.name}
        </Text>
        <Text>From CustomView</Text>
    </View>
);
