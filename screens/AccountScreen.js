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
    RefreshControl,
    StyleSheet
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import LinearGradient from "react-native-linear-gradient";
import AuthContext from '../Auth';

import * as firebase from 'firebase';
import axios from 'axios';
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';
import Functions from '../constants/Functions';
import Badges from '../constants/Badges';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';

function AccountScreen({ navigation }) {
    const { signOut } = React.useContext(AuthContext);
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        refreshing: false,
        user: global.loggedInUser,
    })
    useEffect(() => {
        loadProfile()
        return () => {};
    }, []);
    async function onLogoutClicked() {
        // GoogleSignin.revokeAccess();
        // GoogleSignin.signOut();
        
        firebase.auth().signOut().then(() => {
            global.loggedInUser = undefined
            signOut()
        })
    }
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
                    {'MY ACCOUNT'}
                </Text>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => {                    
                    onLogoutClicked()                    
                }} style={{marginStart: 15}}>
                    <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'LOGOUT'}
                    </Text>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    navigation.push('EditAccount')
                }} style={{marginRight: 15}}>
                    <Image source={require('../assets/images/icon_settings.png')} style={{width: 26, height: 26, resizeMode: 'contain'}} />
                </TouchableOpacity>
            )
        })
    })
    function loadProfile() {
        setState(prevState => ({...prevState, loading: true, refreshing: false}))
        axios.get('apis/load_user', {
            params: {
                userId: global.loggedInUser.id,
            }
        })
        .then(function (response) {
            setState(prevState => ({...prevState, loading: false, refreshing: false, user: response.data.user}))       
        })
        .catch(function (error) {
            console.log(error)
            setState(prevState => ({...prevState, loading: false, refreshing: false}))
            setTimeout(() => {
                Functions.shared().showErrorMessage("Network Error", (error.response == undefined || error.response.data == undefined) ? 'Some problems occurred. please try again.' : error.response.data, "Try again")
            }, 100)
        });
    }
    function calculateScore() {
        if (state.user.totalPromises == 0) {
            return 0
        }
        const keptPromisesPercentage = ((state.user.totalPromises - state.user.brokenPromises) / state.user.totalPromises) * 100
        const latePromisesPercentage = (state.user.latePromises * 0.5 / state.user.totalPromises) * 100

        return Math.round(keptPromisesPercentage - latePromisesPercentage)
    }
    function isEarnedArchivement(archivementId) {
        for (let index = 0; index < state.user.archivements.length; index++) {
            if (state.user.archivements[index].archivementId == archivementId) {
                console.log(archivementId)
                return true
            } 
        }
        return false
    }
    return (
        <View style={{flex: 1, alignItems: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Loading...'}/>
            <ScrollView 
                refreshControl={
                    <RefreshControl
                        refreshing={state.refreshing}
                        onRefresh={loadProfile}
                    />
                } 
                showsVerticalScrollIndicator={false} 
                style={{width: Layouts.screenWidth}}
            >
                <View style={{flexDirection: 'row', alignItems: 'center', paddingStart: 20, paddingBottom: 20, paddingTop: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.primary_darker}}>
                    <Image source={{uri: global.uploadURL + state.user.photo}} style={{backgroundColor: Colors.gray_lighter, width: 70, height: 70, borderRadius: 35}} />
                    <Text style={{marginStart: 15, fontSize: 28, color: Colors.white, alignSelf: 'center', fontFamily: 'GothamCondensed-Medium', justifyContent: 'center'}}>
                        {state.user.firstName + ' ' + state.user.lastName}
                    </Text>
                </View>
                <View style={{paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15, borderBottomWidth: 0.5, borderBottomColor: Colors.primary_darker}}>
                    <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'ACCOUNTABILITY SCORE'}
                    </Text>
                    <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', justifyContent: 'space-between'}}>
                        <Progress.Circle
                            size={90}
                            indeterminate={false} 
                            progress={calculateScore() / 100}
                            color={"#9CCE79"}
                            unfilledColor={"#323C52"}
                            borderWidth={0}
                            showsText={true}
                            formatText={progress => {
                                return calculateScore()
                            }}
                            style={{
                                backgroundColor: "#5F6C86",
                                borderRadius: 90,
                                marginTop: 10
                            }}
                            textStyle={{
                                fontSize: 62,
                                color: "#fff",
                                fontFamily: 'GothamCondensed-Bold',
                                fontWeight: "normal"
                            }}
                        />
                        <View>
                            <TouchableOpacity onPress={() => {
                                state.user.onTimePromises != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'ON_TIME_MADE_BY_ME', category: 'ALL'})
                            }} style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Image source={require('../assets/images/icon_emoji_happy_filled.png')} style={{resizeMode: 'contain', width: 30, height: 30}} />
                                <View style={{marginStart: 10}}>
                                    <Text style={{fontSize: 24, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                        {state.user.onTimePromises}
                                    </Text>
                                    <Text style={{fontSize: 16, color: Colors.text_light, fontFamily: 'GothamCondensed-Medium'}}>
                                        {'ON TIME'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                state.user.latePromises != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'LATE_MADE_BY_ME', category: 'ALL'})
                            }} style={{marginTop: 15, flexDirection: 'row', alignItems: 'center'}}>
                                <Image source={require('../assets/images/icon_emoji_late_filled.png')} style={{resizeMode: 'contain', width: 30, height: 30}} />
                                <View style={{marginStart: 10}}>
                                    <Text style={{fontSize: 24, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                        {state.user.latePromises}
                                    </Text>
                                    <Text style={{fontSize: 16, color: Colors.text_light, fontFamily: 'GothamCondensed-Medium'}}>
                                        {'LATE'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <TouchableOpacity onPress={() => {
                                state.user.extensionPromises != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'EXTENSION_MADE_BY_ME', category: 'ALL'})
                            }} style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Image source={require('../assets/images/icon_clock.png')} style={{resizeMode: 'contain', width: 30, height: 30, tintColor: Colors.white}} />
                                <View style={{marginStart: 10}}>
                                    <Text style={{fontSize: 24, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                        {state.user.extensionPromises}
                                    </Text>
                                    <Text style={{fontSize: 16, color: Colors.text_light, fontFamily: 'GothamCondensed-Medium'}}>
                                        {'EXTENSIONS'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                state.user.brokenPromises != '0' && 
                                navigation.push('Promises', {index: 0, loadType: 'BROKEN_MADE_BY_ME', category: 'ALL'})
                            }} style={{marginTop: 15, flexDirection: 'row', alignItems: 'center'}}>
                                <Image source={require('../assets/images/icon_emoji_broken_filled.png')} style={{resizeMode: 'contain', width: 30, height: 30}} />
                                <View style={{marginStart: 10}}>
                                    <Text style={{fontSize: 24, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                                        {state.user.brokenPromises}
                                    </Text>
                                    <Text style={{fontSize: 16, color: Colors.text_light, fontFamily: 'GothamCondensed-Medium'}}>
                                        {'BROKEN'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15, borderBottomWidth: 0.5, borderBottomColor: Colors.primary_darker}}>
                    <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'OPEN PROMISES MADE BY ME'}
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 15}}>
                        <TouchableOpacity onPress={() => {
                            state.user.dueAfter24PromisesMadeByMe != '0' && 
                            navigation.push('Promises', {index: 0, loadType: 'DUE_AFTER_24_MADE_BY_ME', category: 'ALL'})
                        }} style={{flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                            <LinearGradient colors={Colors.promise_due_1d_gradient} style={{ width: 10, height: '100%', }} />
                            <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.promise_due_1d_gradient[0]}}>
                                {state.user.dueAfter24PromisesMadeByMe.toString()}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            state.user.dueIn24PromisesMadeByMe != '0' && 
                            navigation.push('Promises', {index: 0, loadType: 'DUE_IN_24_MADE_BY_ME', category: 'ALL'})
                        }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                            <LinearGradient colors={Colors.promise_due_24h_gradient} style={{ width: 10, height: '100%', }} />
                            <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.promise_due_24h_gradient[0]}}>
                                {state.user.dueIn24PromisesMadeByMe}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            state.user.overduePromisesMadeByMe != '0' && 
                            navigation.push('Promises', {index: 0, loadType: 'OVERDUE_MADE_BY_ME', category: 'ALL'})
                        }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                            <LinearGradient colors={Colors.promise_overdue_gradient} style={{ width: 10, height: '100%', }} />
                            <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.promise_overdue_gradient[0]}}>
                                {state.user.overduePromisesMadeByMe}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15, borderBottomWidth: 0.5, borderBottomColor: Colors.primary_darker}}>
                    <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'OPEN PROMISES MADE TO ME'}
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 15}}>
                        <TouchableOpacity onPress={() => {
                            state.user.dueAfter24PromisesMadeToMe != '0' && 
                            navigation.push('Promises', {index: 0, loadType: 'DUE_AFTER_24_MADE_TO_ME', category: 'ALL'})
                        }} style={{flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                            <LinearGradient colors={Colors.promise_due_1d_gradient} style={{ width: 10, height: '100%', }} />
                            <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.promise_due_1d_gradient[0]}}>
                                {state.user.dueAfter24PromisesMadeToMe}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            state.user.dueIn24PromisesMadeToMe != '0' && 
                            navigation.push('Promises', {index: 0, loadType: 'DUE_IN_24_MADE_TO_ME', category: 'ALL'})
                        }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                            <LinearGradient colors={Colors.promise_due_24h_gradient} style={{ width: 10, height: '100%', }} />
                            <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.promise_due_24h_gradient[0]}}>
                                {state.user.dueIn24PromisesMadeToMe}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            state.user.overduePromisesMadeToMe != '0' && 
                            navigation.push('Promises', {index: 0, loadType: 'OVERDUE_MADE_TO_ME', category: 'ALL'})
                        }} style={{marginStart: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, width: 60, height: 70, borderRadius: 5, overflow: 'hidden'}}>
                            <LinearGradient colors={Colors.promise_overdue_gradient} style={{ width: 10, height: '100%', }} />
                            <Text style={{width: 50, textAlign: 'center', fontSize: 40, fontFamily: 'GothamCondensed-Medium', color: Colors.promise_overdue_gradient[0]}}>
                                {state.user.overduePromisesMadeToMe}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15, borderBottomWidth: 0, borderBottomColor: Colors.primary_darker, alignItems: 'center'}}>
                    <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'ACHIEVEMENTS (' + state.user.archivements.length + ')'}
                    </Text>
                    <View style={{flexDirection: 'row', marginTop: 25}}>
                        <Image source={Badges.LEVEL_1} style={isEarnedArchivement(Badges.LABEL_LEVEL_1_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                        <Image source={Badges.LEVEL_2} style={isEarnedArchivement(Badges.LABEL_LEVEL_2_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                        <Image source={Badges.LEVEL_3} style={isEarnedArchivement(Badges.LABEL_LEVEL_3_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                        <Image source={Badges.LEVEL_4} style={isEarnedArchivement(Badges.LABEL_LEVEL_4_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 15}}>
                        <Image source={Badges.LEVEL_5} style={isEarnedArchivement(Badges.LABEL_LEVEL_5_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                        <Image source={Badges.LEVEL_6} style={isEarnedArchivement(Badges.LABEL_LEVEL_6_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                        <Image source={Badges.LEVEL_6} style={isEarnedArchivement(Badges.LABEL_LEVEL_7_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                        <Image source={Badges.LEVEL_8} style={isEarnedArchivement(Badges.LABEL_LEVEL_8_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 15}}>
                        <Image source={Badges.LEVEL_9} style={isEarnedArchivement(Badges.LABEL_LEVEL_9_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                        <Image source={Badges.LEVEL_10} style={isEarnedArchivement(Badges.LABEL_LEVEL_10_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                        <Image source={Badges.LEVEL_11} style={isEarnedArchivement(Badges.LABEL_LEVEL_11_ID) ? [styles.badgeStyle] : [styles.badgeStyle, {tintColor: Colors.primary_dark}]} />
                    </View>
                </View>
            </ScrollView>            
        </View>
    )
}

var styles = StyleSheet.create({
    badgeStyle: {
        marginStart: 0, resizeMode: 'contain', width: 56, height: 56
    }
})

export default AccountScreen;