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
    SafeAreaView,
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
import CreateNewPromiseModal from './components/CreateNewPromiseModal';

function PromisesScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        promises: [],
        loading: false,
        loadType: route.params.loadType,
        activeSlide: route.params.index == undefined ? 0 : route.params.index,
        category: route.params.category,
        badge: '',
        isVisibleCreateNewModal: false,
        messageForCreateNewModal: '',
        cardType: '',
        contact: undefined,
    })
    const carouselView = useRef(null)
    function getHeadTitle() {
        let title = "PROMISES"
        switch (route.params.loadType) {
            case 'OPEN_MADE_BY_ME':
                title = "OPEN PROMISES MADE BY ME"
                break;
            case 'OPEN_MADE_TO_ME':
                title = "OPEN PROMISES MADE TO ME"
                break;
            case 'DUE_AFTER_24_MADE_BY_ME':
                title = "OPEN PROMISES MADE BY ME DUE AFTER 24 HOURS"
                break;
            case 'DUE_IN_24_MADE_BY_ME':
                title = "OPEN PROMISES MADE BY ME DUE WITHIN 24 HOURS"
                break;
            case 'OVERDUE_MADE_BY_ME':
                title = "OPEN PROMISES MADE BY ME OVERDUE"
                break;
            case 'DUE_AFTER_24_MADE_TO_ME':
                title = "OPEN PROMISES MADE TO ME DUE AFTER 24 HOURS"
                break;
            case 'DUE_IN_24_MADE_TO_ME':
                title = "OPEN PROMISES MADE TO ME DUE WITHIN 24 HOURS"
                break;
            case 'OVERDUE_MADE_TO_ME':
                title = "OPEN PROMISES MADE TO ME OVERDUE"
                break;
            case 'ON_TIME_MADE_BY_ME':
                title = "ON TIME PROMISES MADE TO ME"
                break;
            case 'EXTENSION_MADE_BY_ME':
                title = "EXTENDED PROMISES MADE TO ME"
                break;
            case 'LATE_MADE_BY_ME':
                title = "LATE PROMISES MADE TO ME"
                break;
            case 'BROKEN_MADE_BY_ME':
                title = "BROKEN PROMISES MADE TO ME"
                break;

            case 'HEAD_TO_HEAD_DUE_AFTER_24_MADE_BY_ME':
                title = "OPEN PROMISES MADE BY ME DUE AFTER 24 HOURS"
                break;
            case 'HEAD_TO_HEAD_DUE_IN_24_MADE_BY_ME':
                title = "OPEN PROMISES MADE BY ME DUE WITHIN 24 HOURS"
                break;
            case 'HEAD_TO_HEAD_OVERDUE_MADE_BY_ME':
                title = "OPEN PROMISES MADE BY ME OVERDUE"
                break;
            case 'HEAD_TO_HEAD_DUE_AFTER_24_MADE_TO_ME':
                title = "OPEN PROMISES MADE TO ME DUE AFTER 24 HOURS"
                break;
            case 'HEAD_TO_HEAD_DUE_IN_24_MADE_TO_ME':
                title = "OPEN PROMISES MADE TO ME DUE WITHIN 24 HOURS"
                break;
            case 'HEAD_TO_HEAD_OVERDUE_MADE_TO_ME':
                title = "OPEN PROMISES MADE TO ME OVERDUE"
                break;

            case 'HEAD_TO_HEAD_ON_TIME_MADE_TO_ME':
                title = "ON TIME PROMISES MADE TO ME"
                break;
            case 'HEAD_TO_HEAD_EXTENSION_MADE_TO_ME':
                title = "EXTENDED PROMISES MADE TO ME"
                break;
            case 'HEAD_TO_HEAD_LATE_MADE_TO_ME':
                title = "LATE PROMISES MADE TO ME"
                break;
            case 'HEAD_TO_HEAD_BROKEN_MADE_TO_ME':
                title = "BROKEN PROMISES MADE TO ME"
                break;
            case 'HEAD_TO_HEAD_ON_TIME_MADE_BY_ME':
                title = "ON TIME PROMISES MADE BY ME"
                break;
            case 'HEAD_TO_HEAD_EXTENSION_MADE_BY_ME':
                title = "EXTENDED PROMISES MADE BY ME"
                break;
            case 'HEAD_TO_HEAD_LATE_MADE_BY_ME':
                title = "LATE PROMISES MADE BY ME"
                break;
            case 'HEAD_TO_HEAD_BROKEN_MADE_BY_ME':
                title = "BROKEN PROMISES MADE BY ME"
                break;
            case 'SINGLE':
                title = "PROMISE"
                break;
            default:
                break;
        }
        return title
    }    
    useEffect(() => {
        loadPromises()
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
                <Text style={{marginHorizontal: 25, fontSize: 16, textAlign: 'center', color: Colors.white, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                    {getHeadTitle()}
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
    const paginationView = () => {
        const { promises, activeSlide } = state;
        return (
            <Pagination
                dotsLength={promises.length}
                activeDotIndex={activeSlide}                
                containerStyle={{height: 40, paddingVertical: 0}}
                dotContainerStyle={{height: 0}}
                dotStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    marginHorizontal: -3,
                    backgroundColor: 'rgba(255, 255, 255, 0.92)'
                }}
                style={{height: 20}}
                inactiveDotStyle={{
                    // Define styles for inactive dots here
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={1}
            />
        );
    }
    function loadPromises() {
        var parameters = {
            userId: global.loggedInUser.id,
            userIdTo: route.params.userIdTo,
            loadType: state.loadType,
        }

        if (route.params.loadType == 'SINGLE') {
            parameters['promiseId'] = route.params.promiseId
        } else {
            parameters['category'] = state.category
        }

        setState(prevState => ({...prevState, loading: true, refreshing: false}))
        axios.get('apis/load_promises', {
            params: parameters
        })
        .then(function (response) {
            setState(prevState => ({...prevState, loading: false, refreshing: false, promises: response.data.promises}))       
        })
        .catch(function (error) {
            console.log(error)
            setState(prevState => ({...prevState, loading: false, refreshing: false}))
            setTimeout(() => {
                Functions.shared().showErrorMessage("Network Error", (error.response == undefined || error.response.data == undefined) ? 'Some problems occurred. please try again.' : error.response.data, "Try again")
            }, 100)
        });
    }
    function completePromise(promiseId, status, promise) {
        // let cardType = ""
        // let contact = undefined
        // if (promise.userIdTo == global.loggedInUser.id && promise.userIdFrom == global.loggedInUser.id) {
        //     cardType = "SELF"
        //     contact = promise.userTo
        // } else if (promise.userIdTo == global.loggedInUser.id) {
        //     cardType = "MADE_TO_ME"
        //     contact = promise.userFrom
        // } else  if (promise.userIdFrom == global.loggedInUser.id) {
        //     cardType = "MADE_FROM_ME"
        //     contact = promise.userTo
        // }

        // let messageForCreateNewModal = ""
        // if (status == 'Late' || status == 'OnTime') {
        //     if (cardType == 'SELF') {
        //         messageForCreateNewModal = "Would you like to add a new promise to yourself?"
        //     } else if (cardType == 'MADE_TO_ME') {
        //         messageForCreateNewModal = "Would you like to add a new promise from " + promise.userFrom.firstName + "?"
        //     } else if (cardType == 'MADE_FROM_ME') {
        //         messageForCreateNewModal = "Would you like to add a new promise to " + promise.userTo.firstName + "?"
        //     }
        // }
        
        // setState(prevState => ({...prevState, isVisibleCreateNewModal: (messageForCreateNewModal != '' && status == 'Late') ? true : false, badge: status == 'OnTime', messageForCreateNewModal: messageForCreateNewModal, cardType: messageForCreateNewModal != '' ? cardType : '', contact: contact, loading: false, promises: prevState.promises.filter((promise) => {
        //     return promise.id != promiseId
        // })}))
        // if (status == 'Broken' && cardType == "MADE_TO_ME") {
        //     setTimeout(() => {
        //         navigation.push('ConfirmBrokenPromise', {promiseId: promiseId})
        //     }, 100)
        // }
        // return

        const body = new FormData();
        body.append('userId', global.loggedInUser.id);
        body.append('promiseId', promiseId);
        body.append('status', status);
        
        axios.post('apis/complete_promise/', body)
            .then(function (response) {
                console.log(response.data)
                setState(prevState => ({...prevState, badge: response.data.badge, loading: false, promises: prevState.promises.filter((promise) => {
                    return promise.id != promiseId
                })}))
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function updatePromiseDeadline(promise, newDeadline) {
        const body = new FormData();
        body.append('promiseId', promise.id);
        body.append('deadline', newDeadline);
        body.append('userId', global.loggedInUser.id);

        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/give_extention_promise/', body)
            .then(function (response) {
                const index = indexOfPromises(promise)
                if (index != -1) {
                    const promises = state.promises
                    promises[index].deadline = newDeadline
                    setState(prevState => ({...prevState, loading: false, promises: promises}))
                } else {
                    setState(prevState => ({...prevState, loading: false}))
                }
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function requestPromiseDeadline(promise, newDeadline, type) {
        const body = new FormData();
        body.append('promiseId', promise.id);
        body.append('deadline', newDeadline);
        body.append('type', type);
        body.append('userId', global.loggedInUser.id);

        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/create_extention_request_promise/', body)
            .then(function (response) {
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage('Success', "You've requested a change for the deadline.", 'OK')
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
    function acceptPromiseRequest(promise) {
        const body = new FormData();
        body.append('promiseId', promise.id);

        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/accept_promise_request/', body)
            .then(function (response) {
                const index = indexOfPromises(promise)
                if (index != -1) {
                    const promises = state.promises
                    promises[index].isRequest = '0'
                    setState(prevState => ({...prevState, loading: false, promises: promises}))
                } else {
                    setState(prevState => ({...prevState, loading: false}))
                }
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function rejectPromiseRequest(promise) {
        const body = new FormData();
        body.append('promiseId', promise.id);
        
        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/reject_promise_request/', body)
            .then(function (response) {
                setState(prevState => ({
                    ...prevState, 
                    loading: false, 
                    promises: prevState.promises.filter((p) => {
                        return p.id != promise.id
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
    function indexOfPromises(promise) {
        for (let index = 0; index < state.promises.length; index++) {
            if (promise.id == state.promises[index].id) {
                return index
            }
        }
        return -1
    }
    function openChat(promise) {
        const opponent = promise.userFrom.userId == global.loggedInUser.id ? promise.userTo : promise.userFrom
        let conversation = {
            badge: 0,
            conversation_id: promise.id + '_' + opponent.uid,
            opponent_id: opponent.uid,
            promise_id: promise.id,
            promise: promise,
            is_favorited: 0,
            is_group: 0,
            name: opponent.firstName,
            photo: opponent.photo,
            online_status: {status: 'offline', lastSeen: firebase.database.ServerValue.TIMESTAMP}
        }
        navigation.push('Chat', {conversation: conversation, insets: insets})
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Loading...'}/>
            {
                state.badge != '' && 
                <BadgeModal 
                    badge={state.badge}
                    visible={state.badge != ''} 
                    onThankYouClicked={() => {
                        if (state.messageForCreateNewModal != "") {
                            setState(prevState => ({...prevState, badge: '', isVisibleCreateNewModal: true}))
                        } else {
                            setState(prevState => ({...prevState, badge: ''}))
                        }
                    }} 
                />
            }
            {
                state.isVisibleCreateNewModal && 
                <CreateNewPromiseModal
                    visible={state.isVisibleCreateNewModal}
                    message={state.messageForCreateNewModal}
                    onNoClicked={() => {
                        setState(prevState => ({...prevState, isVisibleCreateNewModal: false, messageForCreateNewModal: '', cardType: '', contact: undefined}))
                    }}
                    onYesClicked={() => {
                        const { contact, cardType } = state
                        setState(prevState => ({...prevState, isVisibleCreateNewModal: false, messageForCreateNewModal: '', cardType: '', contact: undefined}))
                        setTimeout(() => {
                            if (cardType == 'SELF') {
                                navigation.push('MakeAPromise', {type: 'PROMISE', contact: contact})
                            } else if (cardType == 'MADE_TO_ME') {
                                navigation.push('MakeAPromise', {type: 'REQUEST', contact: contact})
                            } else if (cardType == 'MADE_FROM_ME') {
                                navigation.push('MakeAPromise', {type: 'PROMISE', contact: contact})
                            }
                        }, 100);
                    }}
                />
            }
            <SafeAreaView>
                <View style={{paddingTop: 10, alignItems: 'center'}}>
                    {
                        state.promises.length == 0 && 
                        <View style={{alignSelf: 'center', paddingTop: 25}}>
                            <Text style={{fontFamily: Fonts.GothamMedium, textAlign: 'center', lineHeight: 22, fontSize: 16, color: Colors.gray_light}}>{"NO PROMISES"}</Text>
                        </View>
                    }
                    <Carousel
                        ref={carouselView}
                        data={state.promises}
                        firstItem={state.activeSlide}
                        // initialScrollIndex={state.activeSlide}
                        // initialNumToRender={state.promises.length}
                        // getItemLayout={(data, index) => ({
                        //     length: Layouts.screenWidth - 30,
                        //     offset: (Layouts.screenWidth - 30) * index,
                        //     index,
                        // })}
                        renderItem={({item, index}) => 
                            <CardItem 
                                promise={item}
                                type={state.loadType.includes('MADE_BY_ME') ? 'MADE_BY_ME' : 'MADE_TO_ME'}
                                height={Layouts.screenHeight - (44 + insets.top) - insets.bottom - 55}
                                onEditClicked={(promise) => navigation.push('EditPromise', {promiseId: promise.id})}
                                onMessageClicked={(promise) => {
                                    openChat(promise)
                                }}
                                onUpdateDeadline={(promise, type, newDeadline) => {
                                    if (type == 'UPDATE') {
                                        updatePromiseDeadline(promise, newDeadline)
                                    } else if (type == "EXTENSION_REQUEST") {
                                        requestPromiseDeadline(promise, newDeadline, type)
                                    } else if (type == "EALRY_REQUEST") {
                                        requestPromiseDeadline(promise, newDeadline, type)
                                    }
                                    // if (global.loggedInUser.id == promise.userIdFrom && global.loggedInUser.id == promise.userIdTo) {
                                    //     updatePromiseDeadline(promise, newDeadline)
                                    // } else if (global.loggedInUser.id == promise.userIdFrom) {
                                    //     requestPromiseDeadline(promise, newDeadline)
                                    // } else {
                                    //     updatePromiseDeadline(promise, newDeadline)
                                    // }
                                }}
                                onRejectionNoClicked={(promise) => {
                                    rejectPromiseRequest(promise)
                                }}
                                onRejectionYesClicked={(promise) => {
                                    acceptPromiseRequest(promise)
                                }}
                                onNotificationClicked={(promise) => {
                                    navigation.push('PromiseNotifications', {promise: promise})
                                }}  
                                onBroken={(promise) => {
                                    completePromise(promise.id, 'Broken', promise)
                                }}
                                onKept={(promise, status) => {
                                    completePromise(promise.id, status, promise)
                                }}
                                onUserClicked={(userId) => {
                                    if (global.loggedInUser.id != userId) {
                                        navigation.push('HeadToHead', {userId: userId})
                                    }                                            
                                }}
                            />
                        }
                        onBeforeSnapToItem={(index) => {
                            if (index == 0) {
                                loadPromises()
                            }
                        }}
                        sliderWidth={Layouts.screenWidth}
                        itemWidth={Layouts.screenWidth - 30}
                        loop={false}
                        layout={'default'}
                        layoutCardOffset={0}
                        enableMomentum={false}
                        inactiveSlideScale={1}
                        inactiveSlideOpacity={0.5}
                        useScrollView={true}
                        onLayout={() => {
                            // console.log(state.activeSlide)
                            // carouselView.current.snapToItem(state.activeSlide);
                        }}
                        onSnapToItem={(index) => 
                            setState(prevState => ({...prevState, activeSlide: index}))
                        }
                    />
                    {paginationView()}
                </View>
            </SafeAreaView>
        </View>
    )
}

export default PromisesScreen;