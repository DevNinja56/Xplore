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
    Alert,
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

function EditPromiseScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        isVisibleDeadlinePickerModal: false,
        isVisibleNewCategoryModal: false,
        promise: null,
        description: '',
        category: '',
        deadline: null,
        categoryName: '',
    })
    const categoryMenu = useRef(null)
    const categories = ['NO CATEGORY', 'WORK', 'PERSONAL', 'VACATION', 'CREATE A NEW CATEGORY']
    const TEXT_LENGTH = 300
    const TEXT_HEIGHT = 55
    var GRADIENT_COLOR = Colors.promise_due_1d_gradient
    var TEXT_COLOR = Colors.blue
    var EMOTICON = require('../assets/images/icon_emoji_smile.png')
    const diff = moment.utc(state.deadline).diff(moment(), 'second')
    if (diff < 0) {
        GRADIENT_COLOR = Colors.promise_overdue_gradient
        TEXT_COLOR = Colors.broken
        EMOTICON = require('../assets/images/icon_emoji_broken.png')
    } else if (diff < 86400) {
        GRADIENT_COLOR = Colors.promise_due_24h_gradient
        TEXT_COLOR = Colors.yellow
        EMOTICON = require('../assets/images/icon_emoji_late.png')
    } else {
        GRADIENT_COLOR = Colors.promise_due_1d_gradient
        TEXT_COLOR = Colors.blue
        EMOTICON = require('../assets/images/icon_emoji_smile.png')
    }
    useEffect(() => {
        loadPromise(route.params.promiseId)
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
                    {'EDIT PROMISE'}
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
                                    color: TEXT_COLOR, 
                                    fontSize: 20, 
                                    fontFamily: Fonts.GothamCondensedBook, 
                                }}>
                                    {state.category == 'NO CATEGORY' ? '' : state.category}
                            </Text>
                            <Image source={require('../assets/images/icon_down.png')} style={{marginStart: 10, marginEnd: 0, width: 15, height: 10, resizeMode: 'contain', tintColor: Colors.text_light}} />
                        </TouchableOpacity>
                    }
                    style={{width: Layouts.screenWidth - 140, alignSelf: 'flex-end', borderTopStartRadius: 0, borderTopEndRadius: 0, borderBottomEndRadius: 8, borderBottomStartRadius: 8, marginTop: 46, height: 176, paddingTop: 0, backgroundColor: Colors.white}}
                    >
                    <ScrollView style={{}} contentContainerStyle={{paddingBottom: 10, paddingTop: 10}}>
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
                                        <Text style={{marginStart: 5, fontFamily: 'Gotham-Medium', fontSize: 14, color: state.category == item ? TEXT_COLOR : Colors.gray_light}}>
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
    function onSaveClicked() {
        Keyboard.dismiss()

        if (state.description == '') {
            Functions.shared().showErrorMessage("Make Promise Error", "Please enter a description.", "Try again")
            return;
        } 

        updatePromise()
    }
    function updatePromise() {
        const parameters = {
            description: state.description,
            category: state.category,
            userId: global.loggedInUser.id
        }

        var body = [];
        for (let property in parameters) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(parameters[property]);
            body.push(encodedKey + "=" + encodedValue);
        }
        body = body.join("&");

        setState(prevState => ({...prevState, loading: true}))
        axios.put('/apis/update_promise/' + route.params.promiseId, body)
            .then(function (response) {
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage('Success', "You've updated the promise successfully.", 'OK')
                    navigation.pop()
                }, 100)
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                Functions.shared().showErrorMessage('Update Profile Error', error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, 'Try again')
            });
    }
    function loadPromise(promiseId) {
        setState(prevState => ({...prevState, loading: true, refreshing: false}))
        axios.get('apis/load_promise', {
            params: {
                userId: global.loggedInUser.id,
                promiseId: promiseId
            }
        })
        .then(function (response) {
            setState(prevState => ({
                ...prevState, 
                loading: false, 
                refreshing: false, 
                promise: response.data.promise,
                description: response.data.promise.description,
                category: response.data.promise.category,
                deadline: moment.utc(response.data.promise.deadline).local(),
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
    function deletePromise() {
        const body = new FormData();
        body.append('promiseId', state.promise.id);
        
        setState(prevState => ({...prevState, loading: true}))
        axios.post('apis/delete_promise/', body)
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
    if (state.promise == null) {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
                <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
                <SafeAreaView />
            </View>
        )
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Processing...'}/>
            <SafeAreaView>
                {state.isVisibleNewCategoryModal && NewCategoryModal()}
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{width: Layouts.screenWidth - 30, overflow: 'visible', alignItems: 'center'}}>
                    <View style={{width: Layouts.screenWidth - 40, height: Layouts.screenHeight - (44 + insets.top) - (52 + insets.bottom) - 55, backgroundColor: Colors.white, borderRadius: 8, overflow: 'hidden', flexDirection: 'row'}}>
                        <LinearGradient colors={GRADIENT_COLOR} style={{position: 'absolute', left: state.promise.userIdFrom == global.loggedInUser.id ? 0 : null, right: state.promise.userIdFrom != global.loggedInUser.id ? 0 : null, width: 50, height: '100%', alignItems: 'center' }} >
                            <Image source={EMOTICON} style={{marginTop: 30, width: 45, height: 45}} />
                            <View style={{position: 'absolute', left: 0, top: 130, width: TEXT_HEIGHT, height: TEXT_LENGTH}}>
                                <Text style={{width: TEXT_LENGTH, height: TEXT_HEIGHT, fontSize: 60, fontFamily: 'GothamCondensed-Light', color: Colors.gray_lighter, transform: [{ rotate: '90deg' }, { translateX: TEXT_LENGTH / 2 - TEXT_HEIGHT / 2 }, { translateY: TEXT_LENGTH / 2 - TEXT_HEIGHT / 2 }]}}>{'PROMISE'}</Text>
                            </View>
                            {
                                state.promise.userIdFrom != global.loggedInUser.id && state.promise.userIdTo == global.loggedInUser.id &&
                                <TouchableOpacity onPress={() => {
                                    Alert.alert(
                                        "Delete Promise",
                                        'Are you sure you want to delete this promise?',
                                        [
                                            {
                                                text: "Cancel",
                                                style: 'default'
                                            },
                                            {
                                            text: 'Delete',
                                                onPress: () => {
                                                    deletePromise()
                                                },
                                                style: 'destructive'
                                            },
                                        ],
                                    );
                                }} style={{position: 'absolute', bottom: 20}}>
                                    <Image style={{width: 32, height: 32, tintColor: Colors.white, opacity: 0.8}} source={require('../assets/images/icon_trash.png')} />
                                </TouchableOpacity>
                            }                            
                        </LinearGradient>
                        <View style={{paddingHorizontal: 20, marginStart: state.promise.userIdFrom == global.loggedInUser.id ? 50 : 0, width: Layouts.screenWidth - 40 - 50, paddingTop: 20}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <View style={{alignItems: 'center'}}>
                                    <View>
                                        <Image source={{uri: global.uploadURL + state.promise.userFrom.photo}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                                    </View>
                                    <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_dark}}>
                                        {state.promise.userIdFrom == global.loggedInUser.id ? 'YOU' : state.promise.userFrom.firstName.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{alignItems: 'center'}}>
                                    <View style={{height: 60, justifyContent: 'center'}}>
                                        <Image source={require('../assets/images/icon_promised.png')} style={{resizeMode: 'contain', width: 80, height: 40}} />
                                    </View>
                                    <Text style={{letterSpacing: 1, marginTop: 3, fontSize: 18, fontFamily: 'Gotham-Medium', color: Colors.gray_lighter}}>{'PROMISE'}</Text>
                                </View>
                                <View style={{alignItems: 'center'}}>
                                    <View>
                                        <Image source={{uri: global.uploadURL + state.promise.userTo.photo}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                                    </View>
                                    <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_dark}}>
                                        {state.promise.userIdFrom != global.loggedInUser.id ? 'YOU' : state.promise.userTo.firstName.toUpperCase()}
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
                                        height: 140,
                                        width: Layouts.screenWidth - 140,
                                        backgroundColor: Colors.white,
                                        borderColor: Colors.gray_light, 
                                        borderWidth: 1, 
                                        borderRadius: 8, 
                                        paddingTop: 10,
                                        paddingHorizontal: 10,
                                        fontFamily: Fonts.GothamCondensedBook,
                                        fontSize: 24,
                                        color: TEXT_COLOR,
                                        marginBottom: 20,
                                    }}
                                    onChangeText={(val) => setState(prevState => ({...prevState, description: val}))}
                                />
                                {CategoryMenu()}
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View style={{paddingVertical: 20}}>
                    <TouchableOpacity onPress={() => {
                        onSaveClicked()
                    }} style={{height: 60, width: Layouts.screenWidth - 40, borderRadius: 30, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'REQUEST CHANGES'}</Text>
                    </TouchableOpacity>
                </View>                
            </SafeAreaView>
        </View>
    )
}

export default EditPromiseScreen;