import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    View,
    Image,
    Platform,
    StatusBar,
    ImageBackground,
    TouchableOpacity,
    Text,
    FlatList,
    ScrollView,
    Alert,
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from "react-native-linear-gradient";
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Menu, { MenuItem } from 'react-native-material-menu';
import Fonts from '../constants/Fonts';
import axios from 'axios';
import Functions from '../constants/Functions';
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';
import BadgeModal from '../constants/BadgeModal';
import moment from 'moment';
import { CardItem } from './components/CardItem';
import * as firebase from 'firebase';

function ConfirmBrokenPromiseScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        promise: undefined,
        loading: false,
    })
    useEffect(() => {
        loadPromise()
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
                    {state.promise == null ? 'LOADING...' : state.promise.userFrom.firstName.toUpperCase() + ' BROKE A PROMISE TO YOU'}
                </Text>
            ),
            headerLeft: () => (
                null
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    navigation.pop()
                }} style={{marginRight: 15}}>
                    <Image source={require('../assets/images/icon_close.png')} style={{width: 16, height: 16, resizeMode: 'contain'}} />
                </TouchableOpacity>
            )
        })
    })
    function loadPromise() {
        setState(prevState => ({...prevState, loading: true, refreshing: false}))
        axios.get('apis/load_promise', {
            params: {
                userId: global.loggedInUser.id,
                promiseId: route.params.promiseId
            }
        })
        .then(function (response) {
            setState(prevState => ({...prevState, loading: false, refreshing: false, promise: response.data.promise}))       
        })
        .catch(function (error) {
            console.log(error)
            setState(prevState => ({...prevState, loading: false, refreshing: false}))
            setTimeout(() => {
                Functions.shared().showErrorMessage("Network Error", (error.response == undefined || error.response.data == undefined) ? 'Some problems occurred. please try again.' : error.response.data, "Try again")
            }, 100)
        });
    }
    function retryPromise(promiseId) {
        const body = new FormData();
        body.append('userId', global.loggedInUser.id);
        body.append('promiseId', promiseId);
        
        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/retry_promise/', body)
            .then(function (response) {
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    navigation.pop()
                }, 100)
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    if (state.promise == undefined) {
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
            <CardItem 
                promise={state.promise} 
                height={Layouts.screenHeight - (44 + insets.top) - insets.bottom - 25 - 80}
                onEditClicked={(promise) => {                    
                }}
                onMessageClicked={(promise) => {
                }}
                onUpdateDeadline={(promise, type, newDeadline) => {                    
                }}
                onRejectionNoClicked={(promise) => {
                }}
                onRejectionYesClicked={(promise) => {
                }}
                onNotificationClicked={(promise) => {
                    navigation.push('PromiseNotifications', {promise: promise})
                }}  
                onBroken={(promise) => {
                }}
                onKept={(promise, status) => {
                }}
                onUserClicked={(userId) => {
                    if (global.loggedInUser.id != userId) {
                        navigation.push('HeadToHead', {userId: userId})
                    }                                            
                }}
            />
            <View style={{alignItems: 'center', width: '100%', paddingHorizontal: 20}}>
                <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                    <TouchableOpacity onPress={() => {
                        retryPromise(route.params.promiseId)
                    }} style={{marginTop: 15, height: 50, width: '48%', borderRadius: 25, backgroundColor: Colors.gray_lighter, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.gray}}>{'RETRY'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        navigation.replace('MakeNewPromise', {type: 'REQUEST', description: state.promise.description, category: state.promise.category})
                    }} style={{marginTop: 15, height: 50, width: '48%', borderRadius: 25, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'REASSIGN'}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => {
                    //Notify promiser
                    navigation.pop()
                }} style={{marginTop: 15, paddingVertical: 5, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontFamily: 'Gotham-Medium', textDecorationLine: 'underline', fontSize: 12, color: Colors.gray_light}}>{'MOVE ON'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ConfirmBrokenPromiseScreen;