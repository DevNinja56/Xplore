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
import { CompactItem } from './components/CompactItem';
import * as firebase from 'firebase';
import CreateNewPromiseModal from './components/CreateNewPromiseModal';

function MadeToMeScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        promises: [],
        activeSlide: 0,
        viewMode: 'Slide',
        category: 'ALL',
        isDropdownVisible: false,
        loading: false,
        refreshing: false,
        isVisibleCreateNewModal: false,
        messageForCreateNewModal: '',
        cardType: '',
        contact: undefined,
        badge: '',
    })
    const categoryMenu = useRef(null)
    const categories = ['ALL', 'WORK', 'PERSONAL', 'VACATION']
    useEffect(() => {
        loadPromises()
        return () => {};
    }, []);
    useEffect(() => {
        loadPromises()
        return () => {};
    }, [state.category]);
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadPromises()
        });
        return unsubscribe;
    }, [navigation]);
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
                null
            ),
            headerLeft: () => (
                <View style={{flexDirection: 'row', marginStart: 15, alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => setState(prevState => ({...prevState, viewMode: 'List'}))}>
                        <Image source={require('../assets/images/icon_list.png')} style={{width: 24, height: 24, resizeMode: 'contain', tintColor: state.viewMode == 'List' ? Colors.white : Colors.gray_light}} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setState(prevState => ({...prevState, viewMode: 'Slide'}))} style={{marginStart: 15}}>
                        <Image source={require('../assets/images/icon_card.png')} style={{width: 24, height: 24, resizeMode: 'contain', tintColor: state.viewMode != 'List' ? Colors.white : Colors.gray_light}} />
                    </TouchableOpacity>
                    <View style={{marginStart: 10}}>
                        <Menu
                            ref={categoryMenu}
                            onHidden={() => {
                                setState(prevState => ({...prevState, isDropdownVisible: false}))
                            }}
                            button={
                                <TouchableOpacity onPress={() => {
                                    categoryMenu.current.show()
                                    setState(prevState => ({...prevState, isDropdownVisible: true}))
                                }} style={{
                                    width: 140,
                                    justifyContent: 'space-between',
                                    flexDirection: 'row', 
                                    alignItems: 'center',
                                    backgroundColor: 'white', 
                                    paddingVertical: 12,
                                    paddingHorizontal: 10,
                                    borderTopStartRadius: 5, 
                                    borderTopEndRadius: 5,
                                    backgroundColor: state.isDropdownVisible ? Colors.primary_dark : Colors.transparent
                                }}>
                                    <Text 
                                        style={{
                                            color: Colors.text_light, 
                                            fontSize: 14, 
                                            fontFamily: 'Gotham-Medium', 
                                        }}>
                                            {'CATEGORIES'}
                                    </Text>
                                    <Image source={require('../assets/images/icon_down.png')} style={{marginStart: 10, marginEnd: 0, width: 15, height: 10, resizeMode: 'contain', tintColor: Colors.text_light}} />
                                </TouchableOpacity>
                            }
                            style={{width: 140, alignSelf: 'flex-end', borderWidth: 0, borderTopStartRadius: 0, borderTopEndRadius: 0, borderBottomEndRadius: 5, borderBottomStartRadius: 5, borderColor: Colors.white, marginTop: 40, height: 192, backgroundColor: Colors.primary_dark}}
                            >
                            <ScrollView style={{}}>
                                {
                                    categories.map((item, index) => 
                                        <MenuItem key={item} onPress={() => {
                                            categoryMenu.current.hide()
                                            setState(prevState => ({...prevState, category: item}))
                                        }} textStyle={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.black}} style={{width: 140, paddingHorizontal: 10, justifyContent: 'center'}}>
                                            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: 120}}>
                                                <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: state.category == item ? Colors.white : Colors.text_dark}}>
                                                    {item}
                                                </Text>
                                                <Image source={require('../assets/images/icon_check.png')} style={{tintColor: state.category == item ? Colors.white : Colors.primary_dark, width: 15, height: 11, resizeMode: 'contain'}} />
                                            </View>
                                        </MenuItem>
                                    )
                                }
                            </ScrollView>
                        </Menu>
                    </View>
                    {/* <TouchableOpacity style={{marginStart: 15, flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{fontSize: 14, color: '#B8C3DA', alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                            {'CATEGORIES'}
                        </Text>
                        <Image source={require('../assets/images/icon_down.png')} style={{marginStart: 5, width: 15, height: 10, resizeMode: 'contain'}} />
                    </TouchableOpacity> */}
                </View>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    navigation.push('MakeNewPromise', {type: 'REQUEST'})
                }} style={{marginRight: 15}}>
                    <Image source={require('../assets/images/icon_new_promise_flip.png')} style={{width: 34, height: 34, resizeMode: 'contain'}} />
                </TouchableOpacity>
            )
        })
    })
    const paginationView = () => {
        const { promises, activeSlide } = state;
        return (
            <ScrollView horizontal showsVerticalScrollIndicator={false} style={{maxWidth: Layouts.screenWidth - 0, marginHorizontal: 0, alignSelf: 'center'}} contentContainerStyle={{justifyContent: 'center'}}>
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
            </ScrollView>
        );
    }
    function loadPromises() {
        // setState(prevState => ({...prevState, loading: true, refreshing: false}))
        const params = {
            userId: global.loggedInUser.id,
            loadType: 'OPEN_MADE_TO_ME',
            category: state.category
        }
        console.log(params)
        axios.get('apis/load_promises', {
            params: params
        })
        .then(function (response) {
            setState(prevState => ({...prevState, loading: false, refreshing: false, promises: response.data.promises}))
        })
        .catch(function (error) {
            console.log(error)
            setState(prevState => ({...prevState, loading: false, refreshing: false}))
            // setTimeout(() => {
            //     Functions.shared().showErrorMessage("Network Error", (error.response == undefined || error.response.data == undefined) ? 'Some problems occurred. please try again.' : error.response.data, "Try again")
            // }, 100)
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
                let cardType = ""
                let contact = undefined
                if (promise.userIdTo == global.loggedInUser.id && promise.userIdFrom == global.loggedInUser.id) {
                    cardType = "SELF"
                    contact = promise.userTo
                } else if (promise.userIdTo == global.loggedInUser.id) {
                    cardType = "MADE_TO_ME"
                    contact = promise.userFrom
                } else  if (promise.userIdFrom == global.loggedInUser.id) {
                    cardType = "MADE_FROM_ME"
                    contact = promise.userTo
                }

                let messageForCreateNewModal = ""
                if (status == 'Late' || status == 'OnTime') {
                    if (cardType == 'SELF') {
                        messageForCreateNewModal = "Would you like to add a new promise to yourself?"
                    } else if (cardType == 'MADE_TO_ME') {
                        messageForCreateNewModal = "Would you like to add a new promise from " + promise.userFrom.firstName + "?"
                    } else if (cardType == 'MADE_FROM_ME') {
                        messageForCreateNewModal = "Would you like to add a new promise to " + promise.userTo.firstName + "?"
                    }
                }
                
                setState(prevState => ({...prevState, isVisibleCreateNewModal: (messageForCreateNewModal != '' && status == 'Late') ? true : false, badge: response.data.badge, messageForCreateNewModal: messageForCreateNewModal, cardType: messageForCreateNewModal != '' ? cardType : '', contact: contact, loading: false, promises: prevState.promises.filter((promise) => {
                    return promise.id != promiseId
                })}))
                if (status == 'Broken' && cardType == "MADE_TO_ME") {
                    setTimeout(() => {
                        navigation.push('ConfirmBrokenPromise', {promiseId: promiseId})
                    }, 100)
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
            {
                state.promises.length == 0 && 
                <View style={{width: Layouts.screenWidth, flex: 1, alignItems: 'center', paddingHorizontal: 0, paddingTop: 10}}>
                    <View style={{height: Layouts.screenHeight - (44 + insets.top) - (60 + insets.bottom) - 30, width: Layouts.screenWidth - 40, backgroundColor: Colors.primary_dark, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontFamily: Fonts.GothamMedium, fontSize: 16, color: Colors.text_light}}>{"YOU DON'T HAVE ANY OPEN\nPROMISES AT THE MOMENT"}</Text>
                        <TouchableOpacity style={{marginTop: 10}} onPress={() => loadPromises()}>
                            <Image source={require('../assets/images/icon_refresh.png')} style={{width: 24, height: 24, tintColor: Colors.text_light}} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.push('MakeNewPromise', {type: 'REQUEST'})} style={{position: 'absolute', bottom: 20, height: 50, width: Layouts.screenWidth - 80, borderRadius: 25, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_create_promise_flip.png')} style={{position: 'absolute', left: 15, width: 30, height: 30, resizeMode: 'contain'}} />
                            <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'PROMISE MADE TO ME'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
            {
                state.promises.length != 0 && 
                <View style={{paddingTop: 10}}>                
                    {state.viewMode == 'List' ?
                        <FlatList
                            data={state.promises}
                            renderItem={({item, index}) => 
                                <CompactItem 
                                    promise={item}  
                                    index={index}
                                    isVisibleMessage={true}
                                    onMessageClicked={(promise) => {

                                    }}
                                    onUserClicked={(userId) => {
                                        if (global.loggedInUser.id != userId) {
                                            navigation.push('HeadToHead', {userId: userId})
                                        }
                                    }}
                                    onPromiseClicked={(index, loadType) => {
                                        navigation.push('Promises', {index: index, loadType: 'OPEN_MADE_TO_ME', category: state.category})
                                    }}
                                />
                            }
                            refreshing={state.refreshing}
                            onRefresh={() => loadPromises()}
                            keyExtractor={(item) => item.id}
                            ItemSeparatorComponent={() => (
                                <View style={{height: 15}} />
                            )}
                            style={{marginTop: 0, width: Layouts.screenWidth}}
                            contentContainerStyle={{paddingBottom: 15}}
                        /> : 
                        <View>
                            <Carousel
                                data={state.promises}
                                renderItem={({item, index}) => 
                                    <CardItem 
                                        promise={item} 
                                        type={'MADE_TO_ME'}
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
                                onSnapToItem={(index) => setState(prevState => ({...prevState, activeSlide: index}))}
                            />
                            {paginationView()}
                        </View>
                    }
                </View>
            }                      
        </View>
    )
}

export default MadeToMeScreen;