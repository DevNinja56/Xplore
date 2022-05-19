import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    View,
    Image,
    Platform,
    StatusBar,
    ImageBackground,
    TouchableOpacity,
    Text,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import LinearGradient from "react-native-linear-gradient";
import axios from 'axios';
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';
import Functions from '../constants/Functions';

function HeadToHeadScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        refreshing: false,
        user: null,
        userTo: null,
        totalPromisesByMe: 0,
        totalPromisesToMe: 0,
        onTimePromisesByMe: 0,
        onTimePromisesToMe: 0,
        latePromisesByMe: 0,
        latePromisesToMe: 0,
        extensionPromisesByMe: 0,
        extensionPromisesToMe: 0,
        brokenPromisesByMe: 0,
        brokenPromisesToMe: 0,
        dueAfter24PromisesMadeByMe: 0,
        dueAfter24PromisesMadeToMe: 0,
        dueIn24PromisesMadeByMe: 0,
        dueIn24PromisesMadeToMe: 0,
        overduePromisesMadeByMe: 0,
        overduePromisesMadeToMe: 0,
    })
    useEffect(() => {
        loadHeadToHead()
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
                    {'HEAD TO HEAD'}
                </Text>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.pop()} style={{marginLeft: 10, width: 32, height: 32, justifyContent: 'center'}}>
                    <Image resizeMode={'contain'} source={require('../assets/images/icon_back.png')} style={{width: 20, height: 20, tintColor: Colors.primaryColor}} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                null
            )
        })
    })
    function loadHeadToHead() {
        setState(prevState => ({...prevState, loading: true, refreshing: false}))
        axios.get('apis/load_head_to_head', {
            params: {
                userId: global.loggedInUser.id,
                userIdTo: route.params.userId,
            }
        })
        .then(function (response) {
            setState(prevState => (
                {...prevState, 
                    loading: false, 
                    refreshing: false, 
                    user: response.data.user, 
                    userTo: response.data.userTo,
                    totalPromisesByMe: response.data.totalPromisesByMe,
                    totalPromisesToMe: response.data.totalPromisesToMe,
                    onTimePromisesByMe: response.data.onTimePromisesByMe,
                    onTimePromisesToMe: response.data.onTimePromisesToMe,
                    latePromisesByMe: response.data.latePromisesByMe,
                    latePromisesToMe: response.data.latePromisesToMe,
                    extensionPromisesByMe: response.data.extensionPromisesByMe,
                    extensionPromisesToMe: response.data.extensionPromisesToMe,
                    brokenPromisesByMe: response.data.brokenPromisesByMe,
                    brokenPromisesToMe: response.data.brokenPromisesToMe,
                    dueAfter24PromisesMadeByMe: response.data.dueAfter24PromisesMadeByMe,
                    dueAfter24PromisesMadeToMe: response.data.dueAfter24PromisesMadeToMe,
                    dueIn24PromisesMadeByMe: response.data.dueIn24PromisesMadeByMe,
                    dueIn24PromisesMadeToMe: response.data.dueIn24PromisesMadeToMe,
                    overduePromisesMadeByMe: response.data.overduePromisesMadeByMe,
                    overduePromisesMadeToMe: response.data.overduePromisesMadeToMe,
                }))       
        })
        .catch(function (error) {
            console.log(error)
            setState(prevState => ({...prevState, loading: false, refreshing: false}))
            setTimeout(() => {
                Functions.shared().showErrorMessage("Network Error", (error.response == undefined || error.response.data == undefined) ? 'Some problems occurred. please try again.' : error.response.data, "Try again")
            }, 100)
        });
    }
    function calculateScore(total, late, extension, broken) {
        if (total == 0) {
            return 0
        }

        const keptPercentage = ((total - broken) / total) * 100
        const latePercentage = (late * 0.5 / total) * 100

        return Math.round(keptPercentage - latePercentage)
    }    
    if (state.user == null) {
        return (
            <View style={{flex: 1, alignItems: 'center', backgroundColor: Colors.background}}>
                <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
                <DisplayLoadingSpinner visible={state.loading} message={'Loading...'}/>
            </View>
        )
    }
    return (
        <View style={{flex: 1, alignItems: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Loading...'}/>
            <SafeAreaView>
                <ScrollView showsVerticalScrollIndicator={false} style={{width: Layouts.screenWidth}}>
                    <View style={{marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20}}>
                        <View style={{alignItems: 'center'}}>
                            <Image source={{uri: global.uploadURL + state.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 70, height: 70, borderRadius: 35}} />
                            <Text style={{marginTop: 10, fontSize: 24, color: Colors.white, alignSelf: 'center', fontFamily: 'GothamCondensed-Book', justifyContent: 'center'}}>
                                {'ME'}
                            </Text>
                        </View>
                        <Text style={{fontSize: 32, color: Colors.text_light, fontFamily: 'GothamCondensed-Book', justifyContent: 'center'}}>
                            {'VS'}
                        </Text>
                        <View style={{alignItems: 'center'}}>
                            <Image source={{uri: global.uploadURL + state.userTo.photo}} style={{backgroundColor: Colors.gray_lighter, width: 70, height: 70, borderRadius: 35}} />
                            <Text style={{marginTop: 10, fontSize: 24, color: Colors.white, alignSelf: 'center', fontFamily: 'GothamCondensed-Book', justifyContent: 'center'}}>
                                {state.userTo.firstName.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20}}>
                        <Progress.Circle 
                            size={80} 
                            indeterminate={false} 
                            progress={calculateScore(state.totalPromisesByMe, state.latePromisesByMe, state.extensionPromisesByMe, state.brokenPromisesByMe) / 100}
                            color={"#9CCE79"}
                            unfilledColor={"#323C52"}
                            borderWidth={0}
                            showsText={true}
                            formatText={progress => {
                                return calculateScore(state.totalPromisesByMe, state.latePromisesByMe, state.extensionPromisesByMe, state.brokenPromisesByMe)
                            }}
                            style={{
                                backgroundColor: "#5F6C86",
                                borderRadius: 90,
                                marginTop: 10
                            }}
                            textStyle={{
                                fontSize: 40,
                                color: "#fff",
                                fontFamily: 'GothamCondensed-Book',
                                fontWeight: "normal"
                            }}
                        />
                        <Text style={{fontSize: 14, color: Colors.text_light, textAlign: 'center', fontFamily: 'Gotham-Medium'}}>
                            {'ACCOUNTABILITY\nSCORE'}
                        </Text>
                        <Progress.Circle 
                            size={80} 
                            indeterminate={false} 
                            progress={calculateScore(state.totalPromisesToMe, state.latePromisesToMe, state.extensionPromisesToMe, state.brokenPromisesToMe) / 100}
                            color={"#9CCE79"}
                            unfilledColor={"#323C52"}
                            borderWidth={0}
                            showsText={true}
                            formatText={progress => {
                                return calculateScore(state.totalPromisesToMe, state.latePromisesToMe, state.extensionPromisesToMe, state.brokenPromisesToMe)
                            }}
                            style={{
                                backgroundColor: "#5F6C86",
                                borderRadius: 90,
                                marginTop: 10
                            }}
                            textStyle={{
                                fontSize: 40,
                                color: "#fff",
                                fontFamily: 'GothamCondensed-Book',
                                fontWeight: "normal"
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15, borderBottomWidth: 0.5, borderBottomColor: Colors.primary_darker}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <TouchableOpacity onPress={() => {
                                state.onTimePromisesByMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_ON_TIME_MADE_BY_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{alignItems: 'center', width: 84}}>
                                <Text style={{fontSize: 40, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                    {state.onTimePromisesByMe}
                                </Text>
                                <Text style={{fontSize: 12, color: Colors.text_light, fontFamily: 'Gotham-Medium'}}>
                                    {'ON TIME'}
                                </Text>
                            </TouchableOpacity>
                            <Image source={require('../assets/images/icon_emoji_happy_filled.png')} style={{resizeMode: 'contain', width: 64, height: 64}} />
                            <TouchableOpacity onPress={() => {
                                state.onTimePromisesToMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_ON_TIME_MADE_TO_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{alignItems: 'center', width: 84}}>
                                <Text style={{fontSize: 40, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                    {state.onTimePromisesToMe}
                                </Text>
                                <Text style={{fontSize: 12, color: Colors.text_light, fontFamily: 'Gotham-Medium'}}>
                                    {'ON TIME'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15}}>
                            <TouchableOpacity onPress={() => {
                                state.latePromisesByMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_LATE_MADE_BY_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{alignItems: 'center', width: 84}}>
                                <Text style={{fontSize: 40, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                    {state.latePromisesByMe}
                                </Text>
                                <Text style={{fontSize: 12, color: Colors.text_light, fontFamily: 'Gotham-Medium'}}>
                                    {'LATE'}
                                </Text>
                            </TouchableOpacity>
                            <Image source={require('../assets/images/icon_emoji_late_filled.png')} style={{resizeMode: 'contain', width: 64, height: 64}} />
                            <TouchableOpacity onPress={() => {
                                state.latePromisesToMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_LATE_MADE_TO_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{alignItems: 'center', width: 84}}>
                                <Text style={{fontSize: 40, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                    {state.latePromisesToMe}
                                </Text>
                                <Text style={{fontSize: 12, color: Colors.text_light, fontFamily: 'Gotham-Medium'}}>
                                    {'LATE'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15}}>
                            <TouchableOpacity onPress={() => {
                                state.extensionPromisesByMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_EXTENSION_MADE_BY_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{alignItems: 'center', width: 84}}>
                                <Text style={{fontSize: 40, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                    {state.extensionPromisesByMe}
                                </Text>
                                <Text style={{fontSize: 12, color: Colors.text_light, fontFamily: 'Gotham-Medium'}}>
                                    {'EXTENSIONS'}
                                </Text>
                            </TouchableOpacity>
                            <Image source={require('../assets/images/icon_clock.png')} style={{resizeMode: 'contain', width: 64, height: 64, tintColor: Colors.white}} />
                            <TouchableOpacity onPress={() => {
                                state.extensionPromisesToMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_EXTENSION_MADE_TO_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{alignItems: 'center', width: 84}}>
                                <Text style={{fontSize: 40, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                    {state.extensionPromisesToMe}
                                </Text>
                                <Text style={{fontSize: 12, color: Colors.text_light, fontFamily: 'Gotham-Medium'}}>
                                    {'EXTENSIONS'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15}}>
                            <TouchableOpacity onPress={() => {
                                state.brokenPromisesByMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_BROKEN_MADE_BY_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{alignItems: 'center', width: 84}}>
                                <Text style={{fontSize: 40, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                    {state.brokenPromisesByMe}
                                </Text>
                                <Text style={{fontSize: 12, color: Colors.text_light, fontFamily: 'Gotham-Medium'}}>
                                    {'BROKEN'}
                                </Text>
                            </TouchableOpacity>
                            <Image source={require('../assets/images/icon_emoji_broken_filled.png')} style={{resizeMode: 'contain', width: 64, height: 64}} />
                            <TouchableOpacity onPress={() => {
                                state.brokenPromisesToMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_BROKEN_MADE_TO_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{alignItems: 'center', width: 84}}>
                                <Text style={{fontSize: 40, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                    {state.brokenPromisesToMe}
                                </Text>
                                <Text style={{fontSize: 12, color: Colors.text_light, fontFamily: 'Gotham-Medium'}}>
                                    {'BROKEN'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15, borderBottomWidth: 0.5, borderBottomColor: Colors.primary_darker}}>
                        <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                            {'OPEN PROMISES MADE BY ME'}
                        </Text>
                        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 15}}>
                            <TouchableOpacity onPress={() => {
                                state.dueAfter24PromisesMadeByMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_DUE_AFTER_24_MADE_BY_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                                <LinearGradient colors={Colors.promise_due_1d_gradient} style={{ width: 10, height: '100%', }} />
                                <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.blue}}>
                                    {state.dueAfter24PromisesMadeByMe}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                state.dueIn24PromisesMadeByMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_DUE_IN_24_MADE_BY_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                                <LinearGradient colors={Colors.promise_due_24h_gradient} style={{ width: 10, height: '100%', }} />
                                <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.yellow}}>
                                    {state.dueIn24PromisesMadeByMe}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                state.overduePromisesMadeByMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_OVERDUE_MADE_BY_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                                <LinearGradient colors={Colors.promise_overdue_gradient} style={{ width: 10, height: '100%', }} />
                                <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.broken}}>
                                    {state.overduePromisesMadeByMe}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15}}>
                        <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                            {'OPEN PROMISES MADE TO ME'}
                        </Text>
                        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 15}}>
                            <TouchableOpacity onPress={() => {
                                state.dueAfter24PromisesMadeToMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_DUE_AFTER_24_MADE_TO_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                                <LinearGradient colors={Colors.promise_due_1d_gradient} style={{ width: 10, height: '100%', }} />
                                <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.blue}}>
                                    {state.dueAfter24PromisesMadeToMe}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                state.dueIn24PromisesMadeToMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_DUE_IN_24_MADE_TO_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                                <LinearGradient colors={Colors.promise_due_24h_gradient} style={{ width: 10, height: '100%', }} />
                                <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.yellow}}>
                                    {state.dueIn24PromisesMadeToMe}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                state.overduePromisesMadeToMe != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'HEAD_TO_HEAD_OVERDUE_MADE_TO_ME', category: 'ALL', userIdTo: route.params.userId})
                            }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                                <LinearGradient colors={Colors.promise_overdue_gradient} style={{ width: 10, height: '100%', }} />
                                <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.broken}}>
                                    {state.overduePromisesMadeToMe}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

export default HeadToHeadScreen;