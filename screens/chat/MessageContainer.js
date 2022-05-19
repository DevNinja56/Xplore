import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Avatar, Bubble, SystemMessage, Message, MessageText, Day, MessageImage } from 'react-native-gifted-chat';
import moment from 'moment'
import Colors from '../../constants/Colors';
import Layouts from '../../constants/Layouts';
import Fonts from '../../constants/Fonts';

export const renderAvatar = (props) => (
    <Avatar
        {...props}
        containerStyle={{ 
            left: {width: 42, height: 42, borderRadius: 8, marginStart: 25}, 
            right: {width: 42, height: 42, borderRadius: 8, marginEnd: 25} 
        }}
        imageStyle={{ 
            left: {width: 42, height: 42, borderRadius: 8, marginStart: 0}, 
            right: {width: 42, height: 42, borderRadius: 8, marginEnd: 0} 
        }}
    />
);

export const renderBubble = (props) => (    
    <Bubble
        {...props}
        renderTime={() => <Text style={{lineHeight: 20, fontFamily:  Fonts.GothamCondensedLight, fontSize: Layouts.tinyFontSize, color: Colors.grayColor}}>{moment(props.currentMessage.createdAt).format('LT')}</Text>}
        containerStyle={{
            left: { borderColor: Colors.primary , borderWidth: 0 },
            right: { borderColor: Colors.secondary, borderWidth: 0 },
        }}
        wrapperStyle={{
            left: {backgroundColor: 'transparent', borderColor: 'tomato', borderWidth: 0 },
            right: {backgroundColor: 'transparent'},
        }}
        bottomContainerStyle={{
            left: { borderColor: 'purple', borderWidth: 0 },
            right: {},
        }}
        tickStyle={{}}
        usernameStyle={{ color: 'black', fontSize: 0, fontWeight: '100' }}
        containerToNextStyle={{
            left: { borderColor: 'navy', borderWidth: 0 },
            right: {},
        }}
        containerToPreviousStyle={{
            left: { borderColor: 'mediumorchid', borderWidth: 0 },
            right: {},
        }}
    />
);

export const renderSystemMessage = (props) => (
    <SystemMessage
        {...props}
        containerStyle={{alignItems: 'center' }}
        wrapperStyle={{}}
        textStyle={{ textAlign: 'center', color: Colors.grayColor, fontFamily: Fonts.GothamCondensedBook, fontSize: 16 }}
    />
);

export const renderDay = (props) => (
    <Day
        {...props}
        containerStyle={{alignItems: 'center' }}
        wrapperStyle={{}}
        textStyle={{ textAlign: 'center', fontWeight: '500', color: Colors.gray_light, fontFamily: Fonts.GothamCondensedMedium, fontSize: 16, marginTop: 15 }}
    />
);


export const renderMessage = (props) => (
    <Message
        {...props}
        renderDay={renderDay}
        containerStyle={{
            left: {},
            right: {},
        }}
    />
);

export const renderMessageImage = (props) => (
    <MessageImage
        {...props}
        containerStyle={{
            backgroundColor: 'transparent'
        }}
        imageStyle={{
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,
            width: Layouts.screenWidth - 150,
            height: 150,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
            backgroundColor: 'transparent',
            resizeMode: "cover",
            overflow: 'hidden',
        }}
        lightboxProps={{
            renderHeader(close) { 
                return (
                    <TouchableOpacity style={{position: 'absolute', right: 15, top: 15, backgroundColor: 'red'}} onPress={close}>
                        {/* <FeatherIcon name="x" size={24} color={Colors.white} /> */}
                    </TouchableOpacity>   
                )
            },
            springConfig: { tension: 90000, friction: 90000 }
        }}
    />
)

export const renderMessageText = (props) => (
    <MessageText
        {...props}
        containerStyle={{
            left: { backgroundColor: '#e5e5ea', borderColor: Colors.disableColor, borderWidth: 0, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 7 },
            right: { backgroundColor: '#579dec', borderColor: Colors.disableColor, borderWidth: 0, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 7 },
        }}
        textStyle={{
            left: { color: Colors.text, fontFamily: Fonts.GothamCondensedMedium, fontSize: 20 },
            right: { color: Colors.white, fontFamily: Fonts.GothamCondensedMedium, fontSize: 20 },
        }}
        linkStyle={{
            left: { color: 'orange' },
            right: { color: 'orange' },
        }}
        customTextStyle={{ 
            fontSize: 20, 
            fontFamily: Fonts.GothamCondensedMedium
        }}
    />
);

export const renderCustomView = (props) => {
    if (props.currentMessage.schedule == null) {
        return null
    } else {
        let subtitle = ""
        if (props.currentMessage.schedule.type == 'Temp work') {
            const dates = props.currentMessage.schedule.dates.split('||')
            for (let index = 0; index < dates.length; index++) {
                const date = dates[index];
                subtitle = subtitle == '' ? moment(date).format("MMM D") : (subtitle + ', ' + moment(date).format("MMM D"))
                if (index == 1) {
                    break
                }
            }
            if (dates.length > 2) {
                subtitle = subtitle + ' and ' + (dates.length - 2) + ' more day' + ((dates.length - 2) == 1 ? '.' : 's.')
            }
        } else {
            subtitle = moment(props.currentMessage.schedule.time).format("ddd, MMM D, h:mm A")
        }
        return (
            <TouchableOpacity onPress={() => props.onScheduleClicked(props.currentMessage)} style={{flexDirection: 'column', alignItems: 'center', paddingTop: 10, paddingLeft: 15, paddingRight: 15, paddingBottom: 10, borderColor: global.loggedInUser.userType == 'Employee' ? Colors.primary : Colors.secondary, borderWidth: 1, borderRadius: 10}}>
                <Image style={{width: 20, height: 20, tintColor: global.loggedInUser.userType == 'Employee' ? Colors.primary : Colors.secondary}} source={require('../../assets/images/icon_calendar.png')} />
                <Text style={{fontFamily: Fonts.GothamCondensedBook, marginTop: 5, fontSize: 15, color: '#000000'}}>{props.currentMessage.schedule.type}</Text>
                <Text style={{fontFamily: Fonts.GothamCondensedBook, marginTop: 5, fontSize: 12, color: '#989898'}}>{subtitle}</Text>
                {
                    props.currentMessage.user._id == global.loggedInUser.uid ?
                    <View style={{width: 165, flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                        {
                            props.currentMessage.schedule.status == 'requested' ? 
                            <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
                                <TouchableOpacity onPress={() => props.onEditSchedule(props.currentMessage)}>
                                    <Text style={{fontFamily: Fonts.GothamCondensedBook, fontSize: 14, color: Colors.secondary}}>{'Edit'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => props.onCancelSchedule(props.currentMessage)}>
                                    <Text style={{fontFamily: Fonts.GothamCondensedMedium, fontSize: 14, color: Colors.gray}}>{'Cancel'}</Text>
                                </TouchableOpacity>
                            </View>  : 
                            <Text style={{fontFamily: Fonts.GothamCondensedBook, fontSize: 14, color: Colors.gray}}>{
                                props.currentMessage.schedule.status == 'declined' ? 'Declined' : props.currentMessage.schedule.status == 'canceled' ? 'Canceled' : 'Accepted'}
                            </Text>
                        }
                    </View> : 
                    <View style={{width: 165, flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                        {
                            props.currentMessage.schedule.status == 'requested' ? 
                            <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                                <TouchableOpacity onPress={() => props.onDeclineSchedule(props.currentMessage)}>
                                    <Text style={{fontFamily: Fonts.GothamCondensedBook, fontSize: 14, color: Colors.red}}>{'Decline'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => props.onAcceptSchedule(props.currentMessage)}>
                                    <Text style={{fontFamily: Fonts.GothamCondensedBook, fontSize: 14, color: Colors.primary}}>{'Accept'}</Text>
                                </TouchableOpacity>
                            </View> : 
                            <Text style={{fontFamily: Fonts.GothamCondensedBook, fontSize: 14, color: Colors.gray}}>{
                                props.currentMessage.schedule.status == 'declined' ? 'Declined' : props.currentMessage.schedule.status == 'canceled' ? 'Canceled' : 'Accepted'}
                            </Text>
                        }                            
                    </View>
                }
            </TouchableOpacity>
        )
    }
};