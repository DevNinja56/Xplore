import React, {useState} from 'react';
import { Image, View, Text } from 'react-native';
import { InputToolbar, Actions, Composer, Send } from 'react-native-gifted-chat';
import Colors from '../../constants/Colors';
import Layouts from '../../constants/Layouts';
import Fonts from '../../constants/Fonts';

export const renderInputToolbar = (props) => (
    <InputToolbar
        {...props}
        containerStyle={{
            borderTopWidth: 0,
            paddingHorizontal: 25,
            backgroundColor: Colors.white,
        }}
        primaryStyle={{ alignItems: 'flex-start', backgroundColor: Colors.white }}
    />
);

export const renderActions = (props) => {
    return (
        global.loggedInUser.userType == 'Employer' ? 
        <Actions
            {...props}
            containerStyle={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: 10,
                zIndex: 1,
                borderWidth: 0,
                borderRadius: 0,
                borderColor: Colors.primary,
            }}
            icon={() => (            
                <Image style={{width: 22, height: 24, tintColor: '#bdbdbd'}} source={require('../../assets/images/icon_input_date.png')} />
            )}
            options={{

            }}
            optionTintColor="#222B45"
        /> : null
    )
};

export const renderComposer = (props) => (
    <Composer
        {...props}
        textInputStyle={{
            width: Layouts.screenWidth,
            color: '#222B45',
            backgroundColor: Colors.white,
            paddingStart: 15,
            paddingEnd: 62,
            minHeight: 62,
            marginTop: 0,
            marginStart: 0,
            fontFamily: Fonts.GothamMedium,
            fontSize: 18,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors.gray_light,
            paddingTop: 15,
            paddingBottom: 10,
        }}
        placeholder={'Type a message'}
    />
);

export const renderSend = (props) => (
    <Send
        {...props}
        disabled={!props.text}
        containerStyle={{
            width: 46,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            right: 8,
            bottom: 12,
            backgroundColor: Colors.primary,
            shadowColor: "#000", 
            shadowOffset: { 
                width: 0,
                height: 2,
            }, 
            shadowOpacity: 0.03, 
            shadowRadius: 3.84, 
            elevation: 2,
            borderRadius: 5,
            overflow: 'visible'
        }}
    >
        <Image style={{width: 8, height: 14, tintColor: Colors.white}} source={require('../../assets/images/icon_home_next.png')} />
    </Send>
);
