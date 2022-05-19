import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    View,
    Image,
    Platform,
    StatusBar,
    ImageBackground,
    TouchableOpacity,
    Text,
    ScrollView,
    TextInput,
    Keyboard,
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import LinearGradient from "react-native-linear-gradient";
import ImagePicker from 'react-native-image-crop-picker';
import * as firebase from 'firebase';
import axios from 'axios';
import ActionSheet from 'react-native-actionsheet'
import Functions from '../constants/Functions';
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner'

function EditAccountScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        photo: global.loggedInUser.photo,
        firstName: global.loggedInUser.firstName,
        lastName: global.loggedInUser.lastName,
        email: global.loggedInUser.email,
        isNotifyNewRequest: global.loggedInUser.isNotifyNewRequest,
        isNotifyNewPromise: global.loggedInUser.isNotifyNewPromise,
        isNotifyExtensionRequest: global.loggedInUser.isNotifyExtensionRequest,
        isNotifyPromiseBroken: global.loggedInUser.isNotifyPromiseBroken,
        password: '',
        confirmPassword: '',
        loading: false,
    })
    const firstNameTextField = useRef(null)
    const lastNameTextField = useRef(null)
    const emailTextField = useRef(null)
    const passwordTextField = useRef(null)
    const confirmPasswordTextField = useRef(null)
    const photoActionSheet = useRef(null)
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
                    {'EDIT YOUR ACCOUNT'}
                </Text>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    navigation.pop()
                }} style={{marginStart: 15}}>
                    <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'CANCEL'}
                    </Text>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    Keyboard.dismiss()
                    if (state.firstName == '') {
                        Functions.shared().showErrorMessage("Update Profile Error", "Please enter your first name.", "Try again")
                        return;
                    } else if (state.lastName == '') {
                        Functions.shared().showErrorMessage("Update Profile Error", "Please enter your last name.", "Try again")
                        return;
                    }
                    updateProfile(state.firstName, state.lastName, null)
                }} style={{marginEnd: 15}}>
                    <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'SAVE'}
                    </Text>
                </TouchableOpacity>
            )
        })
    })
    function openCamera() {
        ImagePicker.openCamera({
            width: 150,
            height: 150,
            mediaType: 'photo',
            cropping: true,
            forceJpg: true,
        }).then(image => {
            imagePicked(image)
        }).catch(error => {
            console.log(error)
        })
    }    
    function openPicker() {
        ImagePicker.openPicker({
            width: 150,
            height: 150,
            mediaType: 'photo',
            cropping: true,
            forceJpg: true,
        }).then(image => {
            imagePicked(image)
        }).catch(error => {
            console.log(error)
        })
    }
    function imagePicked(image) {
        uploadPhoto(image.path, image.mime, image.size)
    }
    const uploadPhoto = (photo, mime, size) => {
        const body = new FormData();
        if (Platform.OS == 'ios') {
            body.append('file', {
                name: global.loggedInUser.id + '_profile.jpg',
                uri: photo.replace('file://', ''),
            });
        } else {
            body.append('file', {
                name: global.loggedInUser.id + '_profile.jpg',
                type: mime,
                size: size,
                uri: photo,
            });
        }
        
        setState(prevState => ({...prevState, loading: true, errorMessage: ''}))
        axios.post('upload/upload_file/', body)
            .then(function (response) {
                if (response.data.success == true) {
                    setState(prevState => ({...prevState, loading: false}))
                    updateProfile(null, null, response.data.file)
                } else {
                    setState(prevState => ({...prevState, loading: false}))
                    Functions.shared().showErrorMessage('Update Profile Error', response.data.message, 'Try again')
                }                
            })
            .catch(function (error) {
                console.error(error)
                setState(prevState => ({...prevState, loading: false}))
                Functions.shared().showErrorMessage('Update Profile Error', response.data.message, 'Try again')
            });
    }
    function updateProfile(firstName, lastName, photo) {
        const parameters = {
            isNotifyNewRequest: state.isNotifyNewRequest,
            isNotifyNewPromise: state.isNotifyNewPromise,
            isNotifyExtensionRequest: state.isNotifyExtensionRequest,
            isNotifyPromiseBroken: state.isNotifyPromiseBroken
        }
        if (firstName != null) {
            parameters['firstName'] = firstName
        } 
        if (lastName != null) {
            parameters['lastName'] = lastName
        } 
        if (photo != null) {
            parameters['photo'] = photo
        }

        var body = [];
        for (let property in parameters) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(parameters[property]);
            body.push(encodedKey + "=" + encodedValue);
        }
        body = body.join("&");

        setState(prevState => ({...prevState, loading: true}))
        axios.put('/apis/update_user/' + global.loggedInUser.id, body)
            .then(function (response) {
                global.loggedInUser.isNotifyNewRequest = state.isNotifyNewRequest
                global.loggedInUser.isNotifyNewPromise = state.isNotifyNewPromise
                global.loggedInUser.isNotifyExtensionRequest = state.isNotifyExtensionRequest
                global.loggedInUser.isNotifyPromiseBroken = state.isNotifyPromiseBroken

                if (firstName != null) {
                    global.loggedInUser.firstName = firstName
                } 
                if (lastName != null) {
                    global.loggedInUser.lastName = lastName
                }                
                if (photo != null) {
                    global.loggedInUser.photo = photo
                    setState(prevState => ({...prevState, loading: false, photo: photo}))
                } else {
                    setState(prevState => ({...prevState, loading: false}))
                }
                
                Functions.shared().showErrorMessage('Success', "Your profile has been successfully updated.", 'OK')
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                Functions.shared().showErrorMessage('Update Profile Error', error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, 'Try again')
            });
    }
    return (
        <View style={{flex: 1, alignItems: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Updating...'}/>
            <ActionSheet
                ref={photoActionSheet}
                options={['From Camera', 'From Library', 'Cancel']}
                cancelButtonIndex = {2}
                onPress={(index) => {
                    switch (index) {
                        case 0:
                            openCamera();
                            break;
                        case 1:
                            openPicker();
                            break;
                        default:
                            break;
                    }
                }}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={{width: Layouts.screenWidth}} contentContainerStyle={{paddingHorizontal: 0, paddingTop: 10, paddingBottom: 20, alignItems: 'center'}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20}}>
                    <Image source={{uri: global.uploadURL + state.photo}} style={{backgroundColor: Colors.gray_lighter, width: 70, height: 70, borderRadius: 35}} />
                    <TouchableOpacity onPress={() => {
                        photoActionSheet.current.show()
                    }} style={{alignItems: 'center', marginStart: 15, flex: 1, justifyContent: 'center', height: 50, backgroundColor: Colors.text, borderRadius: 30, marginTop: 10, marginBottom: 15}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'CHOOSE A NEW AVATAR'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{marginTop: 15}}>
                    <TextInput
                        ref={firstNameTextField}
                        selectionColor={Colors.background}
                        placeholder={"FIRST NAME"}
                        keyboardType="default"
                        returnKeyType="next"
                        autoCorrect={false}
                        autoCapitalize={'words'}
                        underlineColorAndroid={"transparent"}
                        clearButtonMode={'while-editing'}
                        value={state.firstName}
                        style={{
                            height: 50,
                            width: Layouts.screenWidth - 40,
                            backgroundColor: Colors.white,
                            borderRadius: 5,
                            paddingHorizontal: 15,
                            fontFamily: 'GothamCondensed-Book',
                            fontSize: 20
                        }}
                        onSubmitEditing={() => lastNameTextField.current.focus()}
                        onChangeText={(val) => setState(prevState => ({...prevState, firstName: val}))}
                    />
                </View>
                <View style={{marginTop: 10}}>
                    <TextInput
                        ref={lastNameTextField}
                        selectionColor={Colors.background}
                        placeholder={"LAST NAME"}
                        keyboardType="default"
                        returnKeyType="next"
                        autoCorrect={false}
                        autoCapitalize={'words'}
                        underlineColorAndroid={"transparent"}
                        clearButtonMode={'while-editing'}
                        value={state.lastName}
                        style={{
                            height: 50,
                            width: Layouts.screenWidth - 40,
                            backgroundColor: Colors.white,
                            borderRadius: 5,
                            paddingHorizontal: 15,
                            fontFamily: 'GothamCondensed-Book',
                            fontSize: 20
                        }}
                        onSubmitEditing={() => emailTextField.current.focus()}
                        onChangeText={(val) => setState(prevState => ({...prevState, lastName: val}))}
                    />
                </View>
                <TouchableOpacity style={{
                        marginTop: 10, 
                        height: 50, 
                        width: Layouts.screenWidth - 40, 
                        backgroundColor: Colors.white,
                        borderRadius: 5,
                        paddingHorizontal: 15, justifyContent: 'center'
                    }} onPress={() => navigation.push('EditEmail')}>
                    <Text style={{
                        fontFamily: 'GothamCondensed-Book',
                        fontSize: 20
                    }}>
                        {state.email}
                    </Text>
                    <View style={{position: 'absolute', right: 15}}>
                        <Image source={require('../assets/images/icon_edit_inactive.png')} style={{width: 24, height: 24}} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{
                        marginTop: 10, 
                        height: 50, 
                        width: Layouts.screenWidth - 40, 
                        backgroundColor: Colors.white,
                        borderRadius: 5,
                        paddingHorizontal: 15, justifyContent: 'center'
                    }} onPress={() => navigation.push('ChangePassword')}>
                    <Text style={{
                        fontFamily: 'GothamCondensed-Book',
                        fontSize: 20
                    }}>
                        {'Change Password'}
                    </Text>
                    <View style={{position: 'absolute', right: 15}}>
                        <Image source={require('../assets/images/icon_edit_inactive.png')} style={{width: 24, height: 24}} />
                    </View>
                </TouchableOpacity>
                <View style={{width: Layouts.screenWidth, paddingHorizontal: 20, marginTop: 20, borderTopWidth: 0.5, borderTopColor: Colors.primary_darker}}>
                    <Text style={{marginTop: 20, fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'NOTIFICATION SETTINGS'}
                    </Text>
                    <TouchableOpacity onPress={() => {
                        setState(prevState => ({...prevState, isNotifyNewRequest: prevState.isNotifyNewRequest == '1' ? '0' : '1'}))
                    }} style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                        <View style={{width: 28, height: 28, borderRadius: 5, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_check.png')} style={{resizeMode: 'contain', width: 16, height: 16, tintColor: state.isNotifyNewRequest == '1' ? Colors.primary : Colors.white}} />
                        </View>
                        <Text style={{marginStart: 10, fontSize: 16, color: Colors.white, fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                            {'NEW REQUESTS'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        setState(prevState => ({...prevState, isNotifyNewPromise: prevState.isNotifyNewPromise == '1' ? '0' : '1'}))
                    }} style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                        <View style={{width: 28, height: 28, borderRadius: 5, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_check.png')} style={{resizeMode: 'contain', width: 16, height: 16, tintColor: state.isNotifyNewPromise == '1' ? Colors.primary : Colors.white}} />
                        </View>
                        <Text style={{marginStart: 10, fontSize: 16, color: Colors.white, fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                            {'NEW PROMISES TO YOU'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        setState(prevState => ({...prevState, isNotifyExtensionRequest: prevState.isNotifyExtensionRequest == '1' ? '0' : '1'}))
                    }} style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                        <View style={{width: 28, height: 28, borderRadius: 5, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_check.png')} style={{resizeMode: 'contain', width: 16, height: 16, tintColor: state.isNotifyExtensionRequest == '1' ? Colors.primary : Colors.white}} />
                        </View>
                        <Text style={{marginStart: 10, fontSize: 16, color: Colors.white, fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                            {'EXTENSION REQUESTS'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        setState(prevState => ({...prevState, isNotifyPromiseBroken: prevState.isNotifyPromiseBroken == '1' ? '0' : '1'}))
                    }} style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                        <View style={{width: 28, height: 28, borderRadius: 5, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_check.png')} style={{resizeMode: 'contain', width: 16, height: 16, tintColor: state.isNotifyPromiseBroken == '1' ? Colors.primary : Colors.white}} />
                        </View>
                        <Text style={{marginStart: 10, fontSize: 16, color: Colors.white, fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                            {'WHEN A PROMISE IS BROKEN'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default EditAccountScreen;