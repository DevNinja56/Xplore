import React from 'react';
import { Image, Text } from 'react-native';
import { InputToolbar, Actions, Composer, Send } from 'react-native-gifted-chat';
import Colors from '../constants/Colors';
import Fonts from '../constants/Fonts';
import { Layouts } from '../constants/Layouts';

export const renderInputToolbar = (props) => (
    <InputToolbar
        {...props}
        containerStyle={{
            backgroundColor: 'white',
            paddingTop: 0,
            paddingBottom: 0,
            paddingStart: 15,
            paddingEnd: 15,
            borderTopColor: '#ebebeb',
            borderTopWidth: 0,
        }}
        primaryStyle={{ alignItems: 'center' }}
    />
);

export const renderActions = (props) => (
    <Actions
        {...props}
        containerStyle={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
            marginRight: 4,
            marginBottom: 0,
        }}
        icon={() => (
            <Image
                style={{ width: 32, height: 32 }}
                source={{
                    uri: 'https://placeimg.com/32/32/any',
                }}
            />
        )}
        options={{
            'Choose From Library': () => {
                console.log('Choose From Library');
            },
            Cancel: () => {
                console.log('Cancel');
            },
        }}
        optionTintColor="#222B45"
    />
);

export const renderComposer = (props) => (
    <Composer
        {...props}
        textInputStyle={{
            color: '#222B45',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderWidth: 0,
            borderRadius: 20,
            borderColor: '#E4E9F2',
            paddingTop: 12.5,
            marginTop: 10,
            marginBottom: 10,
            // paddingTop: 0,
            // marginTop: 0,
            // marginBottom: 0,
            paddingHorizontal: 15,
            marginLeft: 0,
            fontFamily: Fonts.GothamMedium, 
            letterSpacing: 0,
            fontSize: 14,
        }}
    />
);

export const renderSend = (props) => (
    <Send
        {...props}
        disabled={!props.text}
        containerStyle={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 0,
            marginStart: 10,
            backgroundColor: Colors.blue
        }}
    >
        <Image style={{width: 16, height: 16}} source={require('../assets/images/icon_send.png')} />
    </Send>
);
