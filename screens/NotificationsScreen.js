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

function NotificationsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        activities: [],
        refreshing: false,
    })
    useEffect(() => {
        loadActivities()
        return () => {};
    }, []);
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
                    {'NOTIFICATIONS'}
                </Text>
            ),
            headerLeft: () => (
                null
            ),
            headerRight: () => (
                null
            )
        })
    })
    const NotificationItem = (item, index) => {
        if (item.sourceType == 'PROMISE_YOU_MADE_ADDED') {
            const secondsFromCreatedAt = moment().diff(moment.utc(item.promise.createdAt), 'second')
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>                        
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {'YOU PROMISED '}
                            </Text>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' TO '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' BY '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.promise.deadline).local().format('ddd MMM DD').toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' AT '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.promise.deadline).local().format('hh:mm A').toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    {
                        secondsFromCreatedAt < 86400 && item.promise.isRequest == '1' &&
                        <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                            <TouchableOpacity onPress={() => {
                                acceptPromiseRequest(index)
                            }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                                <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                                <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'ACCEPT'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                rejectPromiseRequest(index)
                            }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                                <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                                <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'REJECT'}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_DUE_24') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {'YOUR PROMISE'}
                            </Text>                            
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' TO '}
                            </Text>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' IS DUE IN 24 HOURS - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'KEPT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'BROKEN'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_DUE_NOW') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {'YOUR PROMISE'}
                            </Text>                            
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' TO '}
                            </Text>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' IS DUE NOW - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'KEPT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'BROKEN'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_OVER_DUE') {
            const deadline = moment.utc(item.promise.deadline)
            const createdAt = moment.utc(item.createdAt)
            const datediff = createdAt.diff(deadline, 'days')
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {'YOUR PROMISE'}
                            </Text>                            
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' TO '}
                            </Text>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {datediff == 0 ? "IS OVER DUE - " : " IS OVER DUE BY " + datediff + " DAYS - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'KEPT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'BROKEN'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_REQUESTED_EARLY_TIME') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' NEEDS YOU KEEP YOUR PROMISE EARLY - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>                            
                        </Text>                        
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginStart: 65, marginEnd: 15, marginBottom: 10}}>
                        <View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                    {'BY '}
                                </Text>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                    {moment.utc(item.promise.deadline).local().format('ddd MMM DD').toUpperCase()}
                                </Text>                                    
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                    {'AT '}
                                </Text>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                    {moment.utc(item.promise.deadline).local().format('hh:mm A').toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                            {'TO'}
                        </Text>
                        <View style={{}}>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                    {'BY '}
                                </Text>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                    {moment.utc(item.request.deadline).local().format('ddd MMM DD').toUpperCase()}
                                </Text>                                    
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                    {'AT '}
                                </Text>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                    {moment.utc(item.request.deadline).local().format('hh:mm A').toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            acceptEarlyRequest(index)
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'ACCEPT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            rejectEarlyRequest(index)
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'REJECT'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_ACCEPTED_MORE_TIME') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' ACCEPTED YOUR REQUEST FOR MORE TIME - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' BY '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.promise.deadline).local().format('ddd MMM DD').toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' AT '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.promise.deadline).local().format('hh:mm A').toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_REJECTED_MORE_TIME') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' REJECTED YOUR REQUEST FOR MORE TIME - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' BY '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.request.deadline).local().format('ddd MMM DD').toUpperCase()}
                            </Text>                                    
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' AT '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.request.deadline).local().format('hh:mm A').toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_GIVEN_MORE_TIME') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' IS GIVING YOU MORE TIME TO KEEP YOUR PROMISE - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' BY '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.request.deadline).local().format('ddd MMM DD').toUpperCase()}
                            </Text>                                    
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' AT '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.request.deadline).local().format('hh:mm A').toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_EDITED') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' CHANGED A PROMISE TO YOU - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            acceptEditRequest(index)
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'ACCEPT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            rejectEditRequest(index)
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'REJECT'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_ACCEPTED_EDIT') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' DID APPROVE YOUR CHANGE TO THE PROMISE YOU MADE - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.request.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_REJECTED_EDIT') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' DID NOT APPROVE YOUR CHANGE TO THE PROMISE YOU MADE - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.request.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_KEPT') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {'NICE JOB KEEPING YOUR PROMISE TO '}
                            </Text>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_COMPLETED_LATE') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {'A BIT LATE, BUT GOOD JOB KEEPING YOUR PROMISE TO '}
                            </Text>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_YOU_MADE_BROKEN') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {'LOOKS LIKE YOU BROKE YOUR PROMISE TO '}
                            </Text>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' - '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        }
        
        else if (item.sourceType == 'PROMISE_MADE_TO_YOU_ADDED') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' PROMISES YOU TO '}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {' BY '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.promise.deadline).local().format('ddd MMM DD').toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' AT '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.promise.deadline).local().format('hh:mm A').toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_DUE_24') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20,}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {"'S PROMISE TO YOU IS DUE IN 24 HOURS - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'KEPT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'BROKEN'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_DUE_NOW') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {"'S PROMISE TO YOU IS DUE NOW - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'KEPT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'BROKEN'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_OVER_DUE') {
            const deadline = moment.utc(item.promise.deadline)
            const createdAt = moment.utc(item.createdAt)
            const datediff = createdAt.diff(deadline, 'days')
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {datediff == 0 ? ("'S PROMISE TO YOU IS OVER DUE - ") : ("'S PROMISE TO YOU IS OVER DUE BY " + datediff + " DAYS" + " - ")}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'KEPT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'BROKEN'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_REQUESTED_MORE_TIME') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {" NEEDS MORE TIME TO KEEP THEIR PROMISE - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginStart: 65, marginEnd: 15, marginBottom: 10}}>
                        <View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                    {'BY '}
                                </Text>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                    {moment.utc(item.promise.deadline).local().format('ddd MMM DD').toUpperCase()}
                                </Text>                                    
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                    {'AT '}
                                </Text>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                    {moment.utc(item.promise.deadline).local().format('hh:mm A').toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                            {'TO'}
                        </Text>
                        <View style={{}}>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                    {'BY '}
                                </Text>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                    {moment.utc(item.request.deadline).local().format('ddd MMM DD').toUpperCase()}
                                </Text>                                    
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                    {'AT '}
                                </Text>
                                <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                    {moment.utc(item.request.deadline).local().format('hh:mm A').toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            acceptExtensionRequest(index)
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'ACCEPT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            rejectExtensionRequest(index)
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'REJECT'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_EDITED') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {" CHANGED A PROMISE TO YOU - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', paddingStart: 65, paddingEnd: 15}}>
                        <TouchableOpacity onPress={() => {
                            acceptEditRequest(index)
                        }} style={{height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_kept.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>
                                {'ACCEPT'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            rejectEditRequest(index)
                        }} style={{marginStart: 10, height: 44, width: (Layouts.screenWidth - 150) / 2, borderRadius: 22, backgroundColor: Colors.broken, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_broken.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>
                                {'REJECT'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_ACCEPTED_EDIT') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray_lighter}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {" DID APPROVE YOUR CHANGE TO THE PROMISE TO YOU - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.request.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_REJECTED_EDIT') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray_lighter}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {" DID NOT APPROVE YOUR CHANGE TO THE PROMISE TO YOU - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.request.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_KEPT') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray_lighter}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {" HAS KEPT THEIR PROMISE - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_COMPLETED_LATE') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray_lighter}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {" HAS COMPLETED THEIR PROMISE, A BIT LATE - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_BROKEN') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray_lighter}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {" HAS BROKEN THEIR PROMISE - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_ACCEPTED_EARLY_TIME') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray_lighter}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {" ACCEPTED YOUR REQUEST FOR EARLY DELIVERY - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' BY '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.promise.deadline).local().format('ddd MMM DD').toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' AT '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.promise.deadline).local().format('hh:mm A').toUpperCase()}
                            </Text>
                        </Text>
                    </View>                    
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else if (item.sourceType == 'PROMISE_MADE_TO_YOU_REJECTED_EARLY_TIME') {
            return (
                <TouchableOpacity onPress={() => {
                    navigation.push('Promises', {index: 0, loadType: 'SINGLE', promiseId: item.promise.id})
                }} style={{width: Layouts.screenWidth, paddingHorizontal: 0, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10}}>
                        <TouchableOpacity onPress={() => {
                            navigation.push('HeadToHead', {userId: item.user.userId})
                        }}>
                            <Image source={{uri: global.uploadURL + item.user.photo}} style={{width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray_lighter}} />
                        </TouchableOpacity>
                        <Text style={{flex: 1, marginStart: 10}}>
                            <Text onPress={() => {
                                navigation.push('HeadToHead', {userId: item.user.userId})
                            }} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.user.firstName.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white, color: Colors.text_light}}>
                                {" REJECTED YOUR REQUEST FOR EARLY DELIVERY - "}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 14, lineHeight: 18, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {item.promise.description.toUpperCase()}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' BY '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.request.deadline).local().format('ddd MMM DD').toUpperCase()}
                            </Text>                                    
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                                {' AT '}
                            </Text>
                            <Text style={{fontSize: 14, fontFamily: 'Gotham-Medium', color: Colors.white}}>
                                {moment.utc(item.request.deadline).local().format('hh:mm A').toUpperCase()}
                            </Text>
                        </Text>
                    </View>
                    <Text style={{marginTop: 0, marginEnd: 15, alignSelf: 'flex-end', fontSize: 12, fontFamily: 'Gotham-Medium', color: Colors.text_light}}>
                        {moment.utc(item.createdAt).fromNow().toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )
        } else {
            return null
        }
    }
    function loadActivities() {
        setState(prevState => ({...prevState, loading: true, refreshing: false}))
        axios.get('apis/load_activities', {
            params: {
                userId: global.loggedInUser.id,
            }
        })
        .then(function (response) {
            setState(prevState => ({...prevState, loading: false, refreshing: false, activities: response.data.activities}))       
        })
        .catch(function (error) {
            console.log(error)
            setState(prevState => ({...prevState, loading: false, refreshing: false}))
            setTimeout(() => {
                Functions.shared().showErrorMessage("Network Error", (error.response == undefined || error.response.data == undefined) ? 'Some problems occurred. please try again.' : error.response.data, "Try again")
            }, 100)
        });
    }
    function acceptExtensionRequest(index) {
        const body = new FormData();
        body.append('requestId', state.activities[index].request.id);

        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/accept_extention_request_promise/', body)
            .then(function (response) {
                setState(prevState => ({
                    ...prevState, 
                    loading: false, 
                    activities: prevState.activities.filter((activity) => {
                        return activity.id != state.activities[index].id
                    })
                }))
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function rejectExtensionRequest(index) {
        const body = new FormData();
        body.append('requestId', state.activities[index].request.id);

        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/reject_extention_request_promise/', body)
            .then(function (response) {
                setState(prevState => ({
                    ...prevState, 
                    loading: false, 
                    activities: prevState.activities.filter((activity) => {
                        return activity.id != state.activities[index].id
                    })
                }))
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function acceptEarlyRequest(index) {
        const body = new FormData();
        body.append('requestId', state.activities[index].request.id);

        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/accept_early_request_promise/', body)
            .then(function (response) {
                setState(prevState => ({
                    ...prevState, 
                    loading: false, 
                    activities: prevState.activities.filter((activity) => {
                        return activity.id != state.activities[index].id
                    })
                }))
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function rejectEarlyRequest(index) {
        const body = new FormData();
        body.append('requestId', state.activities[index].request.id);

        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/reject_early_request_promise/', body)
            .then(function (response) {
                setState(prevState => ({
                    ...prevState, 
                    loading: false, 
                    activities: prevState.activities.filter((activity) => {
                        return activity.id != state.activities[index].id
                    })
                }))
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function acceptEditRequest(index) {
        const body = new FormData();
        body.append('requestId', state.activities[index].request.id);
        body.append('type', state.activities[index].sourceType);

        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/accept_edit_request_promise/', body)
            .then(function (response) {
                setState(prevState => ({
                    ...prevState, 
                    loading: false, 
                    activities: prevState.activities.filter((activity) => {
                        return activity.id != state.activities[index].id
                    })
                }))
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function rejectEditRequest(index) {
        const body = new FormData();
        body.append('requestId', state.activities[index].request.id);
        body.append('type', state.activities[index].sourceType);

        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/reject_edit_request_promise/', body)
            .then(function (response) {
                setState(prevState => ({
                    ...prevState, 
                    loading: false, 
                    activities: prevState.activities.filter((activity) => {
                        return activity.id != state.activities[index].id
                    })
                }))
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function acceptPromiseRequest(index) {
        const body = new FormData();
        body.append('promiseId', state.activities[index].promise.id);
        
        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/accept_promise_request/', body)
            .then(function (response) {
                setState(prevState => ({
                    ...prevState, 
                    loading: false, 
                    activities: prevState.activities.map((activity) => {
                        if (activity.id == state.activities[index].id) {
                            activity.promise.isRequest = '0'
                        }
                        return activity
                    })
                }))
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function rejectPromiseRequest(index) {
        const body = new FormData();
        body.append('promiseId', state.activities[index].promise.id);
        
        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/reject_promise_request/', body)
            .then(function (response) {
                setState(prevState => ({
                    ...prevState, 
                    loading: false, 
                    activities: prevState.activities.filter((activity) => {
                        return activity.id != state.activities[index].id
                    })
                }))
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Processing...'}/>
            <FlatList
                data={state.activities}
                refreshing={state.refreshing}
                onRefresh={() => loadActivities()}
                renderItem={({item, index}) => NotificationItem(item, index)}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (
                    <View style={{height: 0.5, backgroundColor: Colors.black}} />
                )}
                ListEmptyComponent={() => 
                    <View style={{alignSelf: 'center', paddingTop: 25}}>
                        <Text style={{fontFamily: Fonts.GothamMedium, textAlign: 'center', fontSize: 14, color: Colors.gray_light}}>
                            {"NO NOTIFICATIONS YET"}
                        </Text>
                    </View>
                }
                style={{marginTop: 5, flex: 1, width: Layouts.screenWidth}}
            />
        </View>
    )
}

export default NotificationsScreen;