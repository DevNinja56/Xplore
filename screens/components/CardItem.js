import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, Modal, SafeAreaView, TextInput } from 'react-native';
import moment from 'moment'
import Layouts from '../../constants/Layouts';
import Colors from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from "react-native-linear-gradient";
import Fonts from '../../constants/Fonts';
import DatePicker from 'react-native-date-picker';

export const CardItem = (props) => {
    const insets = useSafeAreaInsets();
    const promise = props.promise
    const [state, setState] = useState({        
        deadline: moment.utc(promise.deadline).local(),
        isVisibleDeadlinePickerModal: false,
        isVisibleDeadlinePicker: false,
        isVisibleRejectionModal: false,
        isVisibleOnTimeModal: false,
        isVisibleOnBrokenModal: false,
        buttonTitle: "CLOSE",
        type: '',
    })
    const TEXT_LENGTH = 300
    const TEXT_HEIGHT = 55
    var GRADIENT_COLOR = Colors.promise_due_1d_gradient
    var TEXT_COLOR = Colors.blue
    var SIDE_PROMISE_COLOR = Colors.gray_lighter
    var PROMISE_ICON = require('../../assets/images/icon_promised.png')

    var EMOTICON = require('../../assets/images/icon_emoji_smile.png')        
    const diff = moment.utc(promise.deadline).diff(moment(), 'second')
    if (diff < 0) {
        GRADIENT_COLOR = Colors.promise_overdue_gradient
        TEXT_COLOR = Colors.broken
        EMOTICON = require('../../assets/images/icon_emoji_broken.png')
    } else if (diff < 86400) {
        GRADIENT_COLOR = Colors.promise_due_24h_gradient
        TEXT_COLOR = Colors.yellow
        EMOTICON = require('../../assets/images/icon_emoji_late.png')
    } else {
        GRADIENT_COLOR = Colors.promise_due_1d_gradient
        TEXT_COLOR = Colors.blue
        EMOTICON = require('../../assets/images/icon_emoji_smile.png')
    }
    if (promise.status == 'OnTime') {
        GRADIENT_COLOR = Colors.CLOSE_CARD_PROMISE
        TEXT_COLOR = Colors.green
        SIDE_PROMISE_COLOR = Colors.white
        EMOTICON = require('../../assets/images/icon_emoji_smile.png')
        PROMISE_ICON = require('../../assets/images/icon_promise_kept.png')
    }
    if (promise.status == 'Late') {
        GRADIENT_COLOR = Colors.CLOSE_CARD_PROMISE
        TEXT_COLOR = Colors.green
        SIDE_PROMISE_COLOR = Colors.white
        EMOTICON = require('../../assets/images/icon_emoji_late.png')
        PROMISE_ICON = require('../../assets/images/icon_promise_kept.png')
    } 
    if (promise.status == 'Broken') {
        GRADIENT_COLOR = Colors.CLOSE_CARD_BROKEN
        TEXT_COLOR = Colors.broken
        SIDE_PROMISE_COLOR = Colors.gray
        EMOTICON = require('../../assets/images/icon_emoji_broken.png')
        PROMISE_ICON = require('../../assets/images/icon_promise_broken.png')
    }
    const secondsFromCreatedAt = moment().diff(moment.utc(promise.createdAt), 'second')
    useEffect(() => {
        return () => {}
    }, []);
    function onClockClicked() {
        setState(prevState => ({...prevState, deadline: moment.utc(promise.deadline).local(), isVisibleDeadlinePickerModal: true, isVisibleDeadlinePicker: false, buttonTitle: 'CLOSE', type: ''}))
    }
    const RejectionModal = () => {
        return (
            <Modal transparent={true} visible={state.isVisibleRejectionModal}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: Colors.white, width: Layouts.screenWidth - 80, borderRadius: 8, overflow: 'hidden', alignItems: 'center', paddingBottom: 20, paddingTop: 10}}>
                        <View style={{flexDirection: 'row', height: 44, alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 80}}>
                            <Text style={{color: Colors.blue, fontFamily: Fonts.GothamMedium, fontSize: 18}}>{'DELETE PROMISE'}</Text>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleRejectionModal: false}))
                            }} style={{position: 'absolute', right: 15}}>
                                <Image source={require('../../assets/images/icon_close.png')} style={{width: 16, height: 16, resizeMode: 'contain'}} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{textAlign: 'center', marginHorizontal: 20, color: Colors.blue, fontFamily: Fonts.GothamCondensedBook, fontSize: 20}}>{'Before we send a note to ' + promise.userTo.firstName + ' ' + promise.userTo.lastName + ', please confirm'}</Text>
                        <TextInput
                            selectionColor={Colors.background}
                            placeholderTextColor={Colors.blue}
                            placeholder={"Add a note for " + promise.userTo.firstName + ' ' + promise.userTo.lastName}
                            multiline={true}
                            autoCapitalize={'sentences'}
                            underlineColorAndroid={"transparent"}
                            value={state.description}
                            style={{
                                height: 120,
                                width: Layouts.screenWidth - 120,
                                backgroundColor: Colors.white,
                                borderColor: Colors.gray_light, 
                                borderWidth: 1, 
                                borderRadius: 8, 
                                paddingTop: 10,
                                paddingHorizontal: 10,
                                marginTop: 10,
                                fontFamily: Fonts.GothamCondensedBook,
                                fontSize: 24,
                                color: Colors.blue,
                            }}
                            onChangeText={(val) => setState(prevState => ({...prevState, description: val}))}
                        />
                        <TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, isVisibleRejectionModal: false}))
                            props.onRejectionNoClicked(promise)
                        }} style={{marginTop: 15, height: 50, width: Layouts.screenWidth - 120, borderRadius: 25, backgroundColor: 'white', borderWidth: 2, borderColor: '#CA4141', alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: '#CA4141'}}>{"I DIDN'T MAKE THIS PROMISE"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, isVisibleRejectionModal: false}))
                            props.onRejectionYesClicked(promise)
                        }} style={{marginTop: 10, height: 50, width: Layouts.screenWidth - 120, borderRadius: 25, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{"OH YEAH, I DID PROMISE THIS"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
    const DeadlinPickerModal = () => {
        return (
            <Modal transparent={true} visible={state.isVisibleDeadlinePickerModal}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: Colors.white, width: Layouts.screenWidth - 40, borderRadius: 8, overflow: 'hidden', alignItems: 'center', paddingBottom: 20, paddingTop: 10}}>
                        <View style={{flexDirection: 'row', height: 44, alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40}}>
                            <Text style={{color: Colors.blue, textAlign: 'center', fontFamily: Fonts.GothamMedium, fontSize: 18}}>{'CHOOSE A NEW DEADLINE'}</Text>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleDeadlinePickerModal: false}))
                            }} style={{position: 'absolute', right: 15}}>
                                <Image source={require('../../assets/images/icon_close.png')} style={{width: 16, height: 16, resizeMode: 'contain'}} />
                            </TouchableOpacity>
                        </View>
                        {
                            !state.isVisibleDeadlinePicker && 
                            <TouchableOpacity
                                style={{
                                    width: Layouts.screenWidth - 80,
                                    height: 40,
                                    marginTop: 5,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'white', 
                                    borderColor: Colors.gray_light, 
                                    borderWidth: 1, 
                                    borderRadius: 8,
                                    marginBottom: 15,
                                }}
                                onPress={() => {
                                    setState(prevState => ({...prevState, isVisibleDeadlinePicker: true}))
                                }}
                            >
                                <Text 
                                    style={{
                                        color: Colors.blue, 
                                        fontSize: 20, 
                                        fontFamily: Fonts.GothamCondensedBook, 
                                    }}>
                                        {state.deadline.format('MM-DD-YYYY hh:mm A')}
                                </Text>
                            </TouchableOpacity>
                        }
                        {
                            state.isVisibleDeadlinePicker && 
                            <DatePicker
                                date={state.deadline.toDate()}
                                onDateChange={(date) => {
                                    if (promise.userIdFrom == global.loggedInUser.id && promise.userIdTo == global.loggedInUser.id) {
                                        if (moment.utc(promise.deadline).diff(moment(date)) == 0) {
                                            buttonTitle = "CLOSE"
                                        } else {
                                            buttonTitle = "CHANGE THE DATE"
                                        }
                                    } else if (promise.userIdFrom == global.loggedInUser.id) {
                                        if (moment.utc(promise.deadline).diff(moment(date)) < 0) {
                                            buttonTitle = "REQUEST THE CHANGE"
                                        } else if (moment.utc(promise.deadline).diff(moment(date)) == 0) {
                                            buttonTitle = "CLOSE"
                                        } else {
                                            buttonTitle = "CHANGE THE DATE"
                                        }
                                    } else {
                                        if (moment.utc(promise.deadline).diff(moment(date)) < 0) {
                                            buttonTitle = "CHANGE THE DATE"
                                        } else if (moment.utc(promise.deadline).diff(moment(date)) == 0) {
                                            buttonTitle = "CLOSE"
                                        } else {
                                            buttonTitle = "REQUEST THE CHANGE"
                                        }
                                    }
                                    

                                    var type = ""
                                    switch (buttonTitle) {
                                        case 'REQUEST THE CHANGE':
                                            if (moment.utc(promise.deadline) < moment(date)) {
                                                type = "EXTENSION_REQUEST"
                                            } else {
                                                type = "EALRY_REQUEST"
                                            }
                                            break;
                                        case 'CHANGE THE DATE':
                                            type = "UPDATE"
                                            break;
                                        case 'CLOSE':
                                            type = ""
                                            break;
                                        default:
                                            break;
                                    }
                                    setState(prevState => ({...prevState, deadline: moment(date), type: type, buttonTitle: buttonTitle}))
                                }}
                                mode={'datetime'}
                                minuteInterval={15}
                                minimumDate={new Date()}
                                style={{backgroundColor: 'white', width: Layouts.screenWidth - 40, alignItems: 'center', justifyContent: 'center'}}
                            />
                        }
                        <TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, isVisibleDeadlinePickerModal: false}))
                            if (state.type != '') {
                                props.onUpdateDeadline(promise, state.type, state.deadline.utc().format('YYYY-MM-DD HH:mm:ss'))
                            }
                        }} style={{marginTop: 15, height: 50, width: Layouts.screenWidth - 80, borderRadius: 30, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{state.buttonTitle}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    };
    const OnTimeModal = () => {
        return (
            <Modal transparent={true} visible={state.isVisibleOnTimeModal}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: Colors.white, width: Layouts.screenWidth - 40, borderRadius: 8, overflow: 'hidden', alignItems: 'center', paddingBottom: 20, paddingTop: 10}}>
                        <View style={{flexDirection: 'row', height: 44, alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 80}}>
                            <Text style={{marginHorizontal: 25, textAlign: 'center', color: Colors.blue, fontFamily: Fonts.GothamMedium, fontSize: 18}}>{'WAS THIS PROMISE\nON TIME'}</Text>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleOnTimeModal: false}))
                            }} style={{position: 'absolute', right: 15}}>
                                <Image source={require('../../assets/images/icon_close.png')} style={{width: 16, height: 16, resizeMode: 'contain'}} />
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: Layouts.screenWidth - 80}}>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleOnTimeModal: false}))
                                props.onKept(promise, 'Late')
                            }} style={{marginTop: 15, height: 50, width: (Layouts.screenWidth - 100) / 2, borderRadius: 25, backgroundColor: Colors.yellow, alignItems: 'center', justifyContent: 'center'}}>
                                <Image source={require('../../assets/images/icon_emoji_late.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                                <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'LATE'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleOnTimeModal: false}))
                                props.onKept(promise, 'OnTime')
                            }} style={{marginTop: 15, height: 50, width: (Layouts.screenWidth - 100) / 2, borderRadius: 25, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                                <Image source={require('../../assets/images/icon_emoji_smile.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                                <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'ON TIME'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    const OnBrokenModal = () => {
        return (
            <Modal transparent={true} visible={state.isVisibleOnBrokenModal}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: Colors.white, width: Layouts.screenWidth - 40, borderRadius: 8, overflow: 'hidden', alignItems: 'center', paddingBottom: 20, paddingTop: 10}}>
                        <View style={{flexDirection: 'row', height: 44, alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 80}}>
                            <Text style={{marginHorizontal: 25, textAlign: 'center', color: Colors.blue, fontFamily: Fonts.GothamMedium, fontSize: 18}}>{'CONFIRM BROKEN PROMISE'}</Text>
                            {/* <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleOnBrokenModal: false}))
                            }} style={{position: 'absolute', right: 15}}>
                                <Image source={require('../../assets/images/icon_close.png')} style={{width: 16, height: 16, resizeMode: 'contain'}} />
                            </TouchableOpacity> */}
                        </View>
                        <Text style={{marginHorizontal: 20, color: Colors.blue, fontFamily: Fonts.GothamCondensedBook, fontSize: 20}}>{'Bummer. Are you sure this promise was broken?'}</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: Layouts.screenWidth - 80}}>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleOnBrokenModal: false}))
                                props.onBroken(promise)
                            }} style={{marginTop: 15, height: 50, width: (Layouts.screenWidth - 100) / 2, borderRadius: 25, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'YES'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleOnBrokenModal: false}))
                            }} style={{marginTop: 15, height: 50, width: (Layouts.screenWidth - 100) / 2, borderRadius: 25, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'NO'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    const isMySelf = promise.userIdTo == promise.userIdFrom
    const cardType = props.type
    const opponent = global.loggedInUser.id == promise.userIdFrom ? promise.userTo : promise.userFrom
    const isChatAvailable = (opponent.userId == global.loggedInUser.id || opponent.uid == null) ? false : true
    return (
        <View style={{width: Layouts.screenWidth - 30, overflow: 'visible', alignItems: 'center'}}>
            {state.isVisibleDeadlinePickerModal && DeadlinPickerModal()}
            {state.isVisibleRejectionModal && RejectionModal()}
            {state.isVisibleOnTimeModal && OnTimeModal()}
            {state.isVisibleOnBrokenModal && OnBrokenModal()}
            <View style={{width: Layouts.screenWidth - 40, height: props.height == null ? (Layouts.screenHeight - (44 + insets.top) - (60 + insets.bottom) - 55) : props.height, backgroundColor: Colors.white, borderRadius: 8, overflow: 'hidden', flexDirection: 'row'}}>
                <LinearGradient 
                    colors={GRADIENT_COLOR} 
                    style={{
                        position: 'absolute', 
                        left: isMySelf ? (cardType == 'MADE_BY_ME' ? 0 : null) : promise.userIdFrom == global.loggedInUser.id ? 0 : null,
                        right: isMySelf ? (cardType == 'MADE_BY_ME' ? null : 0) : promise.userIdTo == global.loggedInUser.id ? 0 : null, 
                        width: 50, 
                        height: '100%', 
                        alignItems: 'center' 
                    }}
                >
                    <Image source={EMOTICON} style={{marginTop: 30, width: 45, height: 45}} />
                    <View style={{position: 'absolute', left: 0, top: 130, width: TEXT_HEIGHT, height: TEXT_LENGTH}}>
                        <Text style={{width: TEXT_LENGTH, height: TEXT_HEIGHT, fontSize: 60, fontFamily: 'GothamCondensed-Light', color: SIDE_PROMISE_COLOR, transform: [{ rotate: '90deg' }, { translateX: TEXT_LENGTH / 2 - TEXT_HEIGHT / 2 }, { translateY: TEXT_LENGTH / 2 - TEXT_HEIGHT / 2 }]}}>{'PROMISE'}</Text>                    
                    </View>
                    {
                        promise.status == 'Created' && 
                        <TouchableOpacity onPress={() => {
                            props.onEditClicked(promise)
                        }} style={{position: 'absolute', bottom: 25}}>
                            <Image style={{width: 26, height: 26, tintColor: Colors.white}} source={require('../../assets/images/icon_edit_inactive.png')} />
                        </TouchableOpacity>
                    }
                    <TouchableOpacity onPress={() => {
                        props.onNotificationClicked(promise)
                    }} style={{position: 'absolute', bottom: 75}}>
                        <Image style={{width: 26, height: 26, tintColor: Colors.white}} source={require('../../assets/images/icon_notification.png')} />
                        {/* <View style={{position: 'absolute', right: -5, top: -5, backgroundColor: Colors.red, borderRadius: 10, paddingHorizontal: 4, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.white}}>{'3'}</Text>
                        </View> */}
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={() => {
                        props.onRejectClicked(promise)
                    }} style={{position: 'absolute', bottom: 125, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center'}}>
                        <Image style={{width: 20, height: 20, tintColor: Colors.white}} source={require('../../assets/images/icon_dislike.png')} />
                    </TouchableOpacity> */}
                    {
                        promise.status == 'Created' && promise.isRequest == '1' && promise.userIdFrom == global.loggedInUser.id && secondsFromCreatedAt < 86400 && 
                        <TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, isVisibleRejectionModal: true}))
                        }} style={{position: 'absolute', bottom: 125, backgroundColor: '#CA4141', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center'}}>
                            <Image style={{width: 18, height: 18, tintColor: Colors.white}} source={require('../../assets/images/icon_dislike.png')} />
                        </TouchableOpacity>
                    }
                </LinearGradient>
                <View style={{marginStart: isMySelf ? (cardType == 'MADE_BY_ME' ? 50 : 0) : promise.userIdTo == global.loggedInUser.id ? 0 : 50, paddingHorizontal: 20, width: Layouts.screenWidth - 40 - 50, paddingTop: 20}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TouchableOpacity onPress={() => props.onUserClicked(promise.userIdFrom)} style={{alignItems: 'center'}}>
                            <View>
                                <Image source={{uri: global.uploadURL + (isMySelf ? global.loggedInUser.photo : promise.userFrom.photo)}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                            </View>
                            <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_dark}}>{promise.userIdFrom == global.loggedInUser.id ? 'I' : promise.userFrom.firstName.toUpperCase()}</Text>
                        </TouchableOpacity>
                        <View style={{alignItems: 'center'}}>
                            <View style={{height: 60, justifyContent: 'center'}}>
                                <Image source={PROMISE_ICON} style={{resizeMode: 'contain', width: 120, height: 40}} />
                            </View>
                            <Text style={{letterSpacing: 1, marginTop: 3, fontSize: 18, fontFamily: 'Gotham-Medium', color: Colors.gray_lighter}}>
                                {isMySelf ? 'PROMISE' : promise.userIdFrom == global.loggedInUser.id ? 'PROMISE' : 'PROMISED'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => props.onUserClicked(promise.userIdTo)} style={{alignItems: 'center'}}>
                            <View>
                                <Image source={{uri: global.uploadURL + (isMySelf ? global.loggedInUser.photo : promise.userTo.photo)}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                            </View>
                            <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_dark}}>{promise.userIdTo == global.loggedInUser.id ? (isMySelf ? 'MYSELF' : 'ME') : promise.userTo.firstName.toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{height: 0.5, width: '100%', backgroundColor: Colors.gray_lighter, marginVertical: 15}} />
                    <View style={{flex: 1, justifyContent: 'flex-end', paddingBottom: 20}}>
                        <View style={{flex: 1, paddingBottom: 15}}>
                            {
                                promise.category != '' && 
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Image style={{width: 20, height: 20, resizeMode: 'contain'}} source={require('../../assets/images/icon_folder.png')} />
                                    <Text style={{marginStart: 10, fontSize: 18, fontFamily: 'GothamCondensed-Medium', color: Colors.gray_light}}>{promise.category}</Text>
                                </View>
                            }
                            <Text ellipsizeMode={'tail'} style={{flex: 1, marginTop: promise.category != '' ? 10 : 0, fontSize: 24, fontFamily: 'GothamCondensed-Book', color: TEXT_COLOR}}>{promise.description}</Text>
                        </View>
                        <View style={{}}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontSize: 16, fontFamily: 'GothamCondensed-Medium', color: Colors.gray_light}}>{'BY'}</Text>
                                <Text style={{fontSize: 20, fontFamily: 'GothamCondensed-Book', color: TEXT_COLOR}}>
                                    {' ' + moment.utc(promise.deadline).local().format('ddd MMM DD').toUpperCase()}
                                </Text>
                                <Text style={{fontSize: 16, fontFamily: 'GothamCondensed-Medium', color: Colors.gray_light}}>{' AT'}</Text>
                                <Text style={{fontSize: 20, fontFamily: 'GothamCondensed-Book', color: TEXT_COLOR}}>
                                    {' ' + moment.utc(promise.deadline).local().format('hh:mm A')}
                                </Text>
                            </View>
                            <View style={{height: 0.5, width: '100%', backgroundColor: Colors.gray_lighter, marginVertical: 15}} />
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                {
                                    promise.status == 'Created' && isChatAvailable ?
                                    <TouchableOpacity onPress={() => {
                                        props.onMessageClicked(promise)
                                    }} style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <View style={{marginTop: 3}}>
                                            <Image source={require('../../assets/images/icon_chat_active.png')} style={{width: 18, height: 18, resizeMode: 'contain'}} />
                                        </View>
                                        <Text style={{marginStart: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.primary_light}}>{"LET'S TALK"}</Text>
                                    </TouchableOpacity> : <View />
                                }
                                {
                                    promise.status == 'Created' && 
                                    <TouchableOpacity onPress={() => onClockClicked()} style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <View style={{marginTop: 0}}>
                                            <Image source={require('../../assets/images/icon_clock.png')} style={{width: 18, height: 18, resizeMode: 'contain'}} />
                                        </View>
                                        <Text style={{marginStart: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.primary_light}}>{isMySelf ? 'GIVE MORE TIME' : promise.userIdFrom == global.loggedInUser.id ? "I NEED MORE TIME" : "GIVE MORE TIME"}</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                            {
                                promise.status == 'Created' && diff < 0 &&
                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <TouchableOpacity onPress={() => {
                                        setState(prevState => ({...prevState, isVisibleOnBrokenModal: true}))
                                    }} style={{marginTop: 15, height: 50, width: '48%', borderRadius: 25, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                                        <Image source={require('../../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                                        <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'BROKEN'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        setState(prevState => ({...prevState, isVisibleOnTimeModal: true}))
                                    }} style={{marginTop: 15, height: 50, width: '48%', borderRadius: 25, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                                        <Image source={require('../../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                                        <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'KEPT'}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            {
                                promise.status == 'Created' && diff > 0 &&
                                <TouchableOpacity onPress={() => {
                                    setState(prevState => ({...prevState, isVisibleOnTimeModal: true}))
                                }} style={{marginTop: 15, height: 50, width: '100%', borderRadius: 25, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                                    <Image source={require('../../assets/images/icon_kept.png')} style={{position: 'absolute', left: 15, width: 30, height: 30, resizeMode: 'contain'}} />
                                    <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'MARK AS KEPT'}</Text>
                                </TouchableOpacity>
                            }                            
                            {
                                promise.status == 'OnTime' && 
                                <Image style={{position: 'absolute', bottom: 50, right: 0, width: 150, height: 150, resizeMode: "contain" }}
                                    source={require("../../assets/images/icon_stamp_kept.png")}
                                    />
                            }
                            {
                                promise.status == 'Late' && 
                                <Image style={{position: 'absolute', bottom: 50, right: 0,  width: 150, height: 150, resizeMode: "contain" }}
                                    source={require("../../assets/images/icon_stamp_late.png")}
                                    />
                            }
                            {
                                promise.status == 'Broken' && 
                                <Image style={{position: 'absolute', bottom: 50, right: 0,  width: 150, height: 150, resizeMode: "contain" }}
                                    source={require("../../assets/images/icon_stamp_broken.png")}
                                    />
                            }
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}