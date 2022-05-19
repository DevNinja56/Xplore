import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, Modal, SafeAreaView, TextInput } from 'react-native';
import moment from 'moment'
import Layouts from '../../constants/Layouts';
import Colors from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from "react-native-linear-gradient";
import Fonts from '../../constants/Fonts';
import DatePicker from 'react-native-date-picker';

export const CompactItem = (props) => {
    const promise = props.promise
    var GRADIENT_COLOR = Colors.promise_due_1d_gradient
    var TEXT_COLOR = Colors.blue
    const diff = moment.utc(promise.deadline).diff(moment(), 'second')
    if (diff < 0) {
        GRADIENT_COLOR = Colors.promise_overdue_gradient
        TEXT_COLOR = Colors.broken
    } else if (diff < 86400) {
        GRADIENT_COLOR = Colors.promise_due_24h_gradient
        TEXT_COLOR = Colors.yellow
    } else {
        GRADIENT_COLOR = Colors.promise_due_1d_gradient
        TEXT_COLOR = Colors.blue
    } 
    useEffect(() => {
        return () => {}
    }, []);
    return (
        <TouchableOpacity onPress={() => {
            props.onPromiseClicked(props.index, promise.userIdFrom == global.loggedInUser.id ? 'OPEN_MADE_BY_ME' : 'OPEN_MADE_TO_ME')
        }} style={{width: Layouts.screenWidth - 30, marginHorizontal: 15, height: 100, borderRadius: 8, backgroundColor: Colors.white, flexDirection: 'row', overflow: 'hidden'}}>
            <LinearGradient colors={GRADIENT_COLOR} style={{ width: 10, height: 100, position: 'absolute', right: promise.userIdFrom == global.loggedInUser.id ? null : 0 }} />
            <View style={{marginStart: promise.userIdFrom == global.loggedInUser.id ? 10 : 0, width: Layouts.screenWidth - 30 - 10, padding: 10}}>
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>                
                    <Text style={{flex: 1, fontSize: 20, color: TEXT_COLOR, fontFamily: 'GothamCondensed-Book', width: "90%"}} numberOfLines={2}>
                        {promise.description}
                    </Text>
                    {
                        props.isVisibleMessage == undefined && 
                        <TouchableOpacity onPress={() => props.onMessageClicked(promise)} style={{marginStart: 10}}>
                            <Image style={{width: 24, height: 24, resizeMode: "contain"}} source={require('../../assets/images/icon_chat_active.png')} />
                        </TouchableOpacity>
                    }
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>         
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{fontSize: 16, fontFamily: 'GothamCondensed-Medium', color: '#c2c2c2'}}>{'BY'}</Text>
                        <Text style={{fontSize: 20, fontFamily: 'GothamCondensed-Book', color: TEXT_COLOR}}>
                            {' ' + moment(promise.deadline).local().format('dddd') + ' '}
                        </Text>
                        <Text style={{fontSize: 16, fontFamily: 'GothamCondensed-Medium', color: '#c2c2c2'}}>{' AT'}</Text>
                        <Text style={{fontSize: 20, fontFamily: 'GothamCondensed-Book', color: TEXT_COLOR}}>
                            {' ' + moment.utc(promise.deadline).local().format('hh:mm A')}
                        </Text>
                    </View>
                    {
                        props.isVisibleUser != false && 
                        <TouchableOpacity onPress={() => props.onUserClicked(promise.userIdFrom == global.loggedInUser.id ? promise.userIdTo : promise.userIdFrom)} style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{fontSize: 18, fontFamily: 'GothamCondensed-Medium', color: '#7c87a2'}}>
                                {promise.userIdFrom == global.loggedInUser.id ? promise.userTo.firstName : promise.userFrom.firstName}
                            </Text>
                            <Image source={{uri: global.uploadURL + (promise.userIdFrom == global.loggedInUser.id ? promise.userTo.photo : promise.userFrom.photo)}} style={{marginStart: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.black}} />
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </TouchableOpacity>
    )
}