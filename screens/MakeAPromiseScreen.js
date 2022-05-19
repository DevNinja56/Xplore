import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
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
    TextInput,
    Keyboard,
    Modal,
    SafeAreaView,
    Animated, 
    Easing
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from "react-native-linear-gradient";
import Menu, { MenuItem } from 'react-native-material-menu';
import Fonts from '../constants/Fonts';
import moment from 'moment';
import Functions from '../constants/Functions';
import axios from 'axios';
import DatePicker from 'react-native-date-picker'
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';
import BadgeModal from '../constants/BadgeModal';
import Badges from '../constants/Badges';

function MakeAPromiseScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        isVisibleConfirmationModal: false,
        isVisibleDeadlinePickerModal: false,
        isVisibleDeadlinePicker: false,
        isVisibleNewCategoryModal: false,
        description: route.params.description == undefined ? '' : route.params.description,
        category: route.params.category == undefined ? '' : route.params.category,
        categoryName: '',
        deadline: moment().add(1, 'days').set('hour', 17).set('minute', 0).set('second', 0),
        newDeadline: null,
        popToTop: false,
        badge: '',
    })
    const categoryMenu = useRef(null)
    const categories = ['NO CATEGORY', 'WORK', 'PERSONAL', 'VACATION', 'CREATE A NEW CATEGORY']
    const TEXT_LENGTH = 300
    const TEXT_HEIGHT = 55
    var GRADIENT_COLOR = Colors.promise_due_1d_gradient
    var TEXT_COLOR = Colors.blue
    var EMOTICON = require('../assets/images/icon_emoji_smile.png')
    useEffect(() => {
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
                    {route.params.type == 'PROMISE' ? 'WHAT DO YOU PROMISE TO DO?' : 'WHAT DID THEY PROMISE YOU?'}
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
    const CategoryMenu = () => {
        return (
            <View style={{marginStart: 0}}>
                <Menu
                    ref={categoryMenu}                    
                    button={
                        <TouchableOpacity onPress={() => {
                            categoryMenu.current.show()
                            setState(prevState => ({...prevState, isVisibleNewCategoryModal: false}))
                        }} style={{
                            width: Layouts.screenWidth - 140,
                            justifyContent: 'space-between',
                            flexDirection: 'row', 
                            alignItems: 'center',
                            backgroundColor: 'white', 
                            borderColor: Colors.gray_light, 
                            borderWidth: 1, 
                            paddingVertical: 12,
                            paddingHorizontal: 10,
                            borderRadius: 8, 
                        }}>
                            <Image style={{width: 20, height: 20, resizeMode: 'contain'}} source={require('../assets/images/icon_folder.png')} />
                            <Text 
                                style={{
                                    position: 'absolute',
                                    left: 40,
                                    top: 14,
                                    color: Colors.blue, 
                                    fontSize: 20, 
                                    fontFamily: Fonts.GothamCondensedBook, 
                                }}>
                                    {state.category == 'NO CATEGORY' ? '' : state.category}
                            </Text>
                            <Image source={require('../assets/images/icon_down.png')} style={{marginStart: 10, marginEnd: 0, width: 15, height: 10, resizeMode: 'contain', tintColor: Colors.text_light}} />
                        </TouchableOpacity>
                    }
                    style={{width: Layouts.screenWidth - 140, alignSelf: 'flex-end', borderTopStartRadius: 0, borderTopEndRadius: 0, borderBottomEndRadius: 5, borderBottomStartRadius: 5, marginTop: 46, height: 176, paddingTop: 0, backgroundColor: Colors.white}}
                    >
                    <ScrollView style={{}}>
                        {
                            categories.map((item, index) => 
                                <MenuItem key={item} onPress={() => {
                                    if (item == 'CREATE A NEW CATEGORY') {
                                        categoryMenu.current.hide()
                                        setTimeout(() => {
                                            setState(prevState => ({...prevState, isVisibleNewCategoryModal: true, categoryName: ''}))
                                        }, 300)
                                    } else {
                                        setState(prevState => ({...prevState, category: item}))
                                        setTimeout(() => {
                                            categoryMenu.current.hide()
                                        }, 100)
                                    }
                                }} textStyle={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.black}} style={{width: Layouts.screenWidth - 140, paddingHorizontal: 10, justifyContent: 'center', paddingTop: 10, height: 35}}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: Layouts.screenWidth - 160}}>
                                        <Text style={{marginStart: 5, fontFamily: 'Gotham-Medium', fontSize: 14, color: state.category == item ? Colors.blue : Colors.gray_light}}>
                                            {item}
                                        </Text>
                                    </View>
                                </MenuItem>
                            )
                        }
                    </ScrollView>
                </Menu>
            </View>
        )
    }
    const ConfirmationModal = () => {
        return (
            <Modal transparent={true} visible={state.isVisibleConfirmationModal}>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
                    <View style={{height: 44 + insets.top, justifyContent: 'center'}}>
                        <View style={{height: 44, width: Layouts.screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleConfirmationModal: false}))
                            }} style={{position: 'absolute', left: 15, width: 32, height: 32, justifyContent: 'center'}}>
                                <Image resizeMode={'contain'} source={require('../assets/images/icon_back.png')} style={{width: 16, height: 16, tintColor: Colors.primaryColor}} />
                            </TouchableOpacity>
                            <Text style={{marginHorizontal: 45, textAlign: 'center', fontSize: 16, color: Colors.white, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                                {route.params.type == 'PROMISE' ? "NICE! PLEASE KEEP YOUR PROMISE" : "NICE! LET'S HOPE THEY KEEP THEIR PROMISE"}
                            </Text>
                            {/* <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleConfirmationModal: false}))
                            }} style={{position: 'absolute', right: 15}}>
                                <Image source={require('../assets/images/icon_close.png')} style={{width: 16, height: 16, resizeMode: 'contain'}} />
                            </TouchableOpacity> */}
                        </View>
                    </View>
                    <View style={{width: Layouts.screenWidth - 30, overflow: 'visible', alignItems: 'center'}}>
                        <View style={{width: Layouts.screenWidth - 40, height: Layouts.screenHeight - (44 + insets.top) - (52 + insets.bottom) - 55, backgroundColor: Colors.white, borderRadius: 8, overflow: 'hidden', flexDirection: 'row'}}>
                            <LinearGradient colors={GRADIENT_COLOR} style={{position: 'absolute', left: route.params.type == 'PROMISE' ? 0 : null, right: route.params.type == 'REQUEST' ? 0 : null, width: 50, height: '100%', alignItems: 'center' }} >
                                <Image source={EMOTICON} style={{marginTop: 30, width: 45, height: 45}} />
                                <View style={{position: 'absolute', left: 0, top: 130, width: TEXT_HEIGHT, height: TEXT_LENGTH}}>
                                    <Text style={{width: TEXT_LENGTH, height: TEXT_HEIGHT, fontSize: 60, fontFamily: 'GothamCondensed-Light', color: Colors.gray_lighter, transform: [{ rotate: '90deg' }, { translateX: TEXT_LENGTH / 2 - TEXT_HEIGHT / 2 }, { translateY: TEXT_LENGTH / 2 - TEXT_HEIGHT / 2 }]}}>{'PROMISE'}</Text>
                                </View>
                            </LinearGradient>
                            <View style={{paddingHorizontal: 20, marginStart: route.params.type == 'PROMISE' ? 50 : 0, width: Layouts.screenWidth - 40 - 50, paddingTop: 20}}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <View style={{alignItems: 'center'}}>
                                        <TouchableOpacity>
                                            <Image source={{uri: global.uploadURL + (route.params.type == 'PROMISE' ? global.loggedInUser.photo : route.params.contact.photo)}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                                        </TouchableOpacity>
                                        <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_dark}}>
                                            {route.params.type == 'PROMISE' ? 'I' : (route.params.contact.userId == global.loggedInUser.id ? 'MYSELF' : route.params.contact.firstName.toUpperCase())}
                                        </Text>
                                    </View>
                                    <View style={{alignItems: 'center'}}>
                                        <View style={{height: 60, justifyContent: 'center'}}>
                                            <Image source={require('../assets/images/icon_promised.png')} style={{resizeMode: 'contain', width: 80, height: 40}} />
                                        </View>
                                        <Text style={{letterSpacing: 1, marginTop: 3, fontSize: 18, fontFamily: 'Gotham-Medium', color: Colors.gray_lighter}}>{route.params.type == 'PROMISE' ? 'PROMISE' : 'PROMISED'}</Text>
                                    </View>
                                    <View style={{alignItems: 'center'}}>
                                        <TouchableOpacity>
                                            <Image source={{uri: global.uploadURL + (route.params.type == 'REQUEST' ? global.loggedInUser.photo : (route.params.contact.userId == global.loggedInUser.id ? global.loggedInUser.photo : route.params.contact.photo))}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                                        </TouchableOpacity>
                                        <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_dark}}>
                                            {route.params.type == 'REQUEST' ? 'ME' : (route.params.contact.userId == global.loggedInUser.id ? 'MYSELF' : route.params.contact.firstName.toUpperCase())}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{height: 0.5, width: '100%', backgroundColor: Colors.gray_lighter, marginVertical: 15}} />
                                <View style={{flex: 1, justifyContent: 'flex-start', paddingBottom: 20}}>
                                    <View style={{flex: 1, paddingBottom: 15}}>
                                        {
                                            state.category != '' && 
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Image style={{width: 20, height: 20, resizeMode: 'contain'}} source={require('../assets/images/icon_folder.png')} />
                                                <Text style={{marginStart: 10, fontSize: 18, fontFamily: 'GothamCondensed-Medium', color: Colors.gray_light}}>{state.category}</Text>
                                            </View>
                                        }
                                        <Text ellipsizeMode={'tail'} style={{flex: 1, marginTop: state.category != '' ? 10 : 0, fontSize: 24, fontFamily: 'GothamCondensed-Book', color: TEXT_COLOR}}>{state.description}</Text>
                                    </View>
                                    <View style={{}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Text style={{fontSize: 16, fontFamily: 'GothamCondensed-Medium', color: Colors.gray_light}}>{'BY'}</Text>
                                            <Text style={{fontSize: 20, fontFamily: 'GothamCondensed-Book', color: TEXT_COLOR}}>
                                                {state.deadline.local().format(' ddd MMM DD').toUpperCase()}
                                            </Text>
                                            <Text style={{fontSize: 16, fontFamily: 'GothamCondensed-Medium', color: Colors.gray_light}}>{' AT'}</Text>
                                            <Text style={{fontSize: 20, fontFamily: 'GothamCondensed-Book', color: TEXT_COLOR}}>
                                                {state.deadline.local().format(' hh:mm A')}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{paddingVertical: 20, flexDirection: 'row', width: Layouts.screenWidth - 40, justifyContent: 'space-between'}}>
                        <TouchableOpacity onPress={() => {
                            createPromise(true)                            
                        }} style={{height: 60, width: (Layouts.screenWidth - 50) / 2, borderRadius: 30, backgroundColor: Colors.text_light, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'MAKE ANOTHER'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            createPromise(false)                            
                        }} style={{height: 60, width: (Layouts.screenWidth - 50) / 2, borderRadius: 30, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'OK'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
    const DeadlinePickerModal = () => {
        return (
            <Modal transparent={true} visible={state.isVisibleDeadlinePickerModal}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: Colors.white, width: Layouts.screenWidth - 40, borderRadius: 8, overflow: 'hidden', alignItems: 'center', paddingBottom: 20, paddingTop: 10}}>
                        <View style={{flexDirection: 'row', height: 44, alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40}}>
                            <Text style={{color: Colors.blue, textAlign: 'center', fontFamily: Fonts.GothamMedium, fontSize: 18}}>{'CHOOSE A DEADLINE'}</Text>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleDeadlinePickerModal: false}))
                            }} style={{position: 'absolute', right: 15}}>
                                <Image source={require('../assets/images/icon_close.png')} style={{width: 16, height: 16, resizeMode: 'contain'}} />
                            </TouchableOpacity>
                        </View>
                        <DatePicker
                            date={state.newDeadline.toDate()}
                            onDateChange={(date) => {
                                setState(prevState => ({...prevState, newDeadline: moment(date)}))
                            }}
                            mode={'datetime'}
                            minuteInterval={15}
                            minimumDate={new Date()}
                            style={{backgroundColor: 'white', width: Layouts.screenWidth, alignItems: 'center', justifyContent: 'center'}}
                        />
                        <TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, isVisibleDeadlinePickerModal: false, deadline: prevState.newDeadline}))
                        }} style={{marginTop: 15, height: 50, width: Layouts.screenWidth - 80, borderRadius: 30, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{'CLOSE'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    };
    const NewCategoryModal = () => {
        return (
            <Modal transparent={true} visible={state.isVisibleNewCategoryModal}>
                <ScrollView keyboardShouldPersistTaps={'handled'} scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: Colors.white, width: Layouts.screenWidth - 80, borderRadius: 8, overflow: 'hidden', alignItems: 'center', paddingBottom: 20, paddingTop: 10}}>
                        <View style={{flexDirection: 'row', height: 44, alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 80}}>
                            <Text style={{textAlign: 'center', color: Colors.blue, fontFamily: Fonts.GothamMedium, fontSize: 18}}>{'CREATE A NEW\nCATEGORY'}</Text>
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, isVisibleNewCategoryModal: false}))
                            }} style={{position: 'absolute', right: 15}}>
                                <Image source={require('../assets/images/icon_close.png')} style={{width: 16, height: 16, resizeMode: 'contain'}} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            selectionColor={Colors.background}
                            placeholderTextColor={Colors.gray_light}
                            placeholder={"NEW CATEGORY NAME"}
                            autoCapitalize={'sentences'}
                            underlineColorAndroid={"transparent"}
                            value={state.categoryName}
                            style={{
                                height: 40,
                                width: Layouts.screenWidth - 120,
                                backgroundColor: Colors.white,
                                borderColor: Colors.gray_light, 
                                borderWidth: 1, 
                                borderRadius: 8, 
                                marginTop: 10,
                                paddingHorizontal: 10,
                                fontFamily: Fonts.GothamCondensedBook,
                                fontSize: 24,
                                color: Colors.blue,
                            }}
                            onChangeText={(val) => setState(prevState => ({...prevState, categoryName: val}))}
                        />
                        <TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, isVisibleNewCategoryModal: false, category: prevState.categoryName}))
                        }} style={{marginTop: 15, height: 50, width: Layouts.screenWidth - 120, borderRadius: 25, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 12, color: Colors.white}}>{"CREATE THIS CATEGORY"}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>
        )
    }
    function onMakPromiseClicked() {
        Keyboard.dismiss()
        if (state.description == '') {
            Functions.shared().showErrorMessage("Make Promise Error", "Please enter a description.", "Try again")
            return;
        }
        setState(prevState => ({...prevState, isVisibleConfirmationModal: true}))        
    }
    function createPromise(makeAnother) {
        // setState(prevState => ({...prevState, loading: true, isVisibleConfirmationModal: false}))
        // setTimeout(() => {
        //     setState(prevState => ({...prevState, loading: false}))
        //     setTimeout(() => {
        //         if (makeAnother) {
        //             if (response.data.badge != "") {
        //                 setState(prevState => ({...prevState, badge: true, popToTop: false, description: '', category: '', deadline: moment().add(1, 'days').set('hour', 17).set('minute', 0).set('second', 0)}))
        //             } else {
        //                 setState(prevState => ({...prevState, badge: false, popToTop: false, description: '', category: '', deadline: moment().add(1, 'days').set('hour', 17).set('minute', 0).set('second', 0)}))
        //             }
        //         } else {
        //             if (response.data.badge != "") {
        //                 setState(prevState => ({...prevState, badge: true, popToTop: true}))
        //             } else {
        //                 navigation.popToTop()
        //             }
        //         }
        //     }, 100)
        // }, 500);
        // return

        const body = new FormData();

        body.append('userIdFrom', route.params.type == 'PROMISE' ? global.loggedInUser.id : route.params.contact.userId);
        body.append('userIdTo', route.params.type == 'REQUEST' ? global.loggedInUser.id : route.params.contact.userId);
        body.append('category', state.category);
        body.append('description', state.description.trim());
        body.append('deadline', state.deadline.utc().format('YYYY-MM-DD HH:mm:ss'));
        body.append('isRequest', route.params.type == 'REQUEST' ? '1' : '0');
      
        setState(prevState => ({...prevState, loading: true, isVisibleConfirmationModal: false}))
        axios.post('apis/create_promise/', body)
            .then(function (response) {
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    if (makeAnother) {
                        // if (response.data.badge != "") {
                        //     setState(prevState => ({...prevState, badge: response.data.badge, popToTop: false, description: '', category: '', deadline: moment().add(1, 'days').set('hour', 17).set('minute', 0).set('second', 0)}))
                        // } else {
                        //     setState(prevState => ({...prevState, badge: response.data.badge, popToTop: false, description: '', category: '', deadline: moment().add(1, 'days').set('hour', 17).set('minute', 0).set('second', 0)}))
                        // }
                        setState(prevState => ({...prevState, popToTop: false, description: '', category: '', deadline: moment().add(1, 'days').set('hour', 17).set('minute', 0).set('second', 0)}))
                    } else {
                        // if (response.data.badge != "") {
                        //     setState(prevState => ({...prevState, badge: response.data.badge, popToTop: true}))
                        // } else {
                        //     navigation.popToTop()
                        // }
                        navigation.popToTop()
                    }
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
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Creating...'}/>
            {
                state.badge != '' && 
                <BadgeModal 
                    badge={state.badge}
                    visible={state.badge != ''} 
                    onThankYouClicked={() => {
                        if (state.popToTop) {
                            navigation.popToTop()
                        } else {
                            setState(prevState => ({...prevState, badge: ''}))
                        }
                    }} 
                />
            }
            {state.isVisibleConfirmationModal && ConfirmationModal()}
            {state.isVisibleDeadlinePickerModal && DeadlinePickerModal()}
            {state.isVisibleNewCategoryModal && NewCategoryModal()}
            <SafeAreaView>
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{width: Layouts.screenWidth - 30, overflow: 'visible', alignItems: 'center'}}>
                    <View style={{width: Layouts.screenWidth - 40, height: Layouts.screenHeight - (44 + insets.top) - (52 + insets.bottom) - 55, backgroundColor: Colors.white, borderRadius: 8, overflow: 'hidden', flexDirection: 'row'}}>
                        <LinearGradient colors={GRADIENT_COLOR} style={{position: 'absolute', left: route.params.type == 'PROMISE' ? 0 : null, right: route.params.type == 'REQUEST' ? 0 : null, width: 50, height: '100%', alignItems: 'center' }} >
                            <Image source={EMOTICON} style={{marginTop: 30, width: 45, height: 45}} />
                            <View style={{position: 'absolute', left: 0, top: 130, width: TEXT_HEIGHT, height: TEXT_LENGTH}}>
                                <Text style={{width: TEXT_LENGTH, height: TEXT_HEIGHT, fontSize: 60, fontFamily: 'GothamCondensed-Light', color: Colors.gray_lighter, transform: [{ rotate: '90deg' }, { translateX: TEXT_LENGTH / 2 - TEXT_HEIGHT / 2 }, { translateY: TEXT_LENGTH / 2 - TEXT_HEIGHT / 2 }]}}>{'PROMISE'}</Text>
                            </View>
                        </LinearGradient>
                        <View style={{paddingHorizontal: 20, marginStart: route.params.type == 'PROMISE' ? 50 : 0, width: Layouts.screenWidth - 40 - 50, paddingTop: 20}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <View style={{alignItems: 'center'}}>
                                    <View>
                                        <Image source={{uri: global.uploadURL + (route.params.type == 'PROMISE' ? global.loggedInUser.photo : route.params.contact.photo)}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                                    </View>
                                    <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_dark}}>
                                        {route.params.type == 'PROMISE' ? 'I' : route.params.contact.firstName.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{alignItems: 'center'}}>
                                    <View style={{height: 60, justifyContent: 'center'}}>
                                        <Image source={require('../assets/images/icon_promised.png')} style={{resizeMode: 'contain', width: 80, height: 40}} />
                                    </View>
                                    <Text style={{letterSpacing: 1, marginTop: 3, fontSize: 18, fontFamily: 'Gotham-Medium', color: Colors.gray_lighter}}>{route.params.type == 'PROMISE' ? 'PROMISE' : 'PROMISED'}</Text>
                                </View>
                                <View style={{alignItems: 'center'}}>
                                    <View>
                                        <Image source={{uri: global.uploadURL + (route.params.type == 'REQUEST' ? global.loggedInUser.photo : (route.params.contact.userId == global.loggedInUser.id ? global.loggedInUser.photo : route.params.contact.photo))}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                                    </View>
                                    <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_dark}}>
                                        {route.params.type == 'REQUEST' ? 'ME' : (route.params.contact.userId == global.loggedInUser.id ? 'MYSELF' : route.params.contact.firstName.toUpperCase())}
                                    </Text>
                                </View>
                            </View>
                            <View style={{height: 0.5, width: '100%', backgroundColor: Colors.gray_lighter, marginVertical: 15}} />
                            <View style={{flex: 1, justifyContent: 'flex-start', paddingBottom: 20}}>
                                <TextInput
                                    selectionColor={Colors.background}
                                    placeholderTextColor={Colors.blue}
                                    placeholder={"Describe your promise..."}
                                    multiline={true}
                                    autoCapitalize={'sentences'}
                                    underlineColorAndroid={"transparent"}
                                    value={state.description}
                                    style={{
                                        height: 120,
                                        width: Layouts.screenWidth - 140,
                                        backgroundColor: Colors.white,
                                        borderColor: Colors.gray_light, 
                                        borderWidth: 1, 
                                        borderRadius: 8, 
                                        paddingTop: 10,
                                        paddingHorizontal: 10,
                                        fontFamily: Fonts.GothamCondensedBook,
                                        fontSize: 24,
                                        color: Colors.blue,
                                    }}
                                    onChangeText={(val) => setState(prevState => ({...prevState, description: val}))}
                                />
                                <Text 
                                    style={{
                                        marginTop: 20,
                                        color: Colors.blue, 
                                        letterSpacing: 1,
                                        fontSize: 12, 
                                        fontFamily: 'Gotham-Medium', 
                                    }}>
                                        {route.params.type == 'PROMISE' ? "YOU'LL HAVE THIS DONE BY:" : "THEY'LL HAVE THIS DONE BY"}
                                </Text>
                                <TouchableOpacity
                                    style={{
                                        width: Layouts.screenWidth - 140,
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
                                    onPress={() => setState(prevState => ({...prevState, isVisibleDeadlinePickerModal: true, newDeadline: prevState.deadline}))}
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
                                {CategoryMenu()}
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View style={{paddingVertical: 20}}>
                    <TouchableOpacity onPress={() => {
                        onMakPromiseClicked()                        
                    }} style={{height: 60, width: Layouts.screenWidth - 40, borderRadius: 30, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{route.params.type == 'PROMISE' ? 'MAKE THIS PROMISE' : 'ADD THIS PROMISE'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default MakeAPromiseScreen;