import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
    View,
    Image,
    Platform,
    StatusBar,
    ImageBackground,
    Text,
    Button,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    Keyboard,
    SafeAreaView,
} from 'react-native';
import Colors from '../../constants/Colors';
import Layouts from '../../constants/Layouts';
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountryPicker from "react-native-country-picker-modal";
import AuthContext from '../../Auth';
import DisplayLoadingSpinner from '../../constants/DisplayLoadingSpinner'

import * as firebase from 'firebase';
import axios from 'axios';
import Functions from '../../constants/Functions';

function CreateAccountScreen({ navigation }) {
    const { signIn } = React.useContext(AuthContext);
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        isReceiveEmail: true,
        country: {
            cca2: "US",
            callingCode: "1"
        },
    })
    const firstNameTextField = useRef(null)
    const lastNameTextField = useRef(null)
    const phoneNumberTextField = useRef(null)
    const emailTextField = useRef(null)
    const passwordTextField = useRef(null)
    const confirmPasswordTextField = useRef(null)
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
                    {'CREATE A NEW ACCOUNT'}
                </Text>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.pop()} style={{marginLeft: 10, width: 32, height: 32, justifyContent: 'center'}}>
                    <Image resizeMode={'contain'} source={require('../../assets/images/icon_back.png')} style={{width: 20, height: 20, tintColor: Colors.primaryColor}} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View onPress={() => navigation.pop()} style={{marginRight: 10, width: 32, height: 32}} />
            ),
        })
    })
    function signUpServer(firebaseUser) {
        const body = new FormData();
        body.append('uid', firebaseUser.uid);
        body.append('firstName', state.firstName);
        body.append('lastName', state.lastName);
        body.append('email', state.email);
        body.append('photo', 'user_photo_placeholder.png');
        body.append('phone', state.country.callingCode + state.phone);
        if (global.pushToken != null && global.pushToken != "") {
            body.append('pushToken', global.pushToken);
        }
        if (global.timezoneOffset != null && global.timezoneOffset != "") {
            body.append('timezoneOffset', global.timezoneOffset);
        }
        axios.post('apis/sign_up/', body)
            .then(function (response) {
                global.loggedInUser = response.data.user
                firebase.database().ref().child('users').child(firebaseUser.uid)
                    .set({
                        user_id: global.loggedInUser.id,
                        photo: global.loggedInUser.photo,
                        first_name: global.loggedInUser.firstName,
                        last_name: global.loggedInUser.lastName,
                        online_status: {status: 'online', last_seen: firebase.database.ServerValue.TIMESTAMP},
                        push_token: global.loggedInUser.pushToken == null ? "" : global.loggedInUser.pushToken,
                        is_push_enabled: parseInt(global.loggedInUser.isPushEnabled)
                    });
                
                setState(prevState => ({...prevState, loading: false}))
                signIn(global.loggedInUser.id)
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                Functions.shared().showErrorMessage("Sign Up Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
            });
    }
    function signUpFirebase() {
        Keyboard.dismiss()

        if (state.firstName == '') {
            Functions.shared().showErrorMessage("Sign Up Error", "Please enter your first name.", "Try again")
            return;
        } else if (state.lastName == '') {
            Functions.shared().showErrorMessage("Sign Up Error", "Please enter your last name.", "Try again")
            return;
        } else if (state.phone == '') {
            Functions.shared().showErrorMessage("Sign Up Error", "Please enter your phone number.", "Try again")
            return;
        } else if (!Functions.shared().isValidEmailAddress(state.email)) {
            Functions.shared().showErrorMessage("Sign Up Error", "Please enter a valid email address.", "Try again")
            return;
        } else if (state.password == '') {
            Functions.shared().showErrorMessage("Sign Up Error", "Please enter a password.", "Try again")
            return;
        } else if (state.confirmPassword != state.password) {
            Functions.shared().showErrorMessage("Sign Up Error", "Password and confirm password does not match.", "Try again")
            return;
        }

        setState(prevState => ({...prevState, loading: true}))
        firebase.auth().createUserWithEmailAndPassword(state.email, state.password)
            .then((data) => {
                signUpServer(data.user)
            })
            .catch((error) => {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                if (error.code === 'auth/email-already-in-use') {
                    Functions.shared().showErrorMessage("Sign Up Error", "The email address is already in use by another account.", "Try again")
                } else {
                    Functions.shared().showErrorMessage("Sign Up Error", error.message, "Try again")
                }
            })
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Signing Up...'}/>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
                <ScrollView scrollEnabled={false} keyboardShouldPersistTaps={'handled'} style={{ flex: 1, width: Layouts.screenWidth }} contentContainerStyle={{ alignItems: 'center', flex: 1 }}>
                    <View style={{marginTop: 25}}>
                        <TextInput
                            ref={firstNameTextField}
                            selectionColor={Colors.background}
                            placeholder={"FIRST NAME"}
                            keyboardType={'default'}
                            returnKeyType="next"
                            autoCorrect={true}
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
                    <View style={{marginTop: 15}}>
                        <TextInput
                            ref={lastNameTextField}
                            selectionColor={Colors.background}
                            placeholder={"LAST NAME"}
                            keyboardType={'default'}
                            returnKeyType="next"
                            autoCorrect={true}
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
                            onSubmitEditing={() => phoneNumberTextField.current.focus()}
                            onChangeText={(val) => setState(prevState => ({...prevState, lastName: val}))}
                        />
                    </View>
                    <View style={{marginTop: 15, flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center'}}>
                        <CountryPicker
                            countryCode={state.country.cca2}
                            closeable
                            withFilter
                            withAlphaFilter
                            withCallingCode
                            style={{alignItems: "center", justifyContent: "center"}}
                            onSelect={(country) => {
                                setState(prevState => ({...prevState, country: country}))
                            }}
                            translation="eng"
                        />
                        <Text onPress={() => {
                            
                        }} style={{fontSize: 20, color: Colors.white, fontFamily: "avenir", fontWeight: "bold", paddingRight: 10, marginTop: 5}}>
                            +{state.country.callingCode}
                        </Text>
                        <TextInput
                            ref={phoneNumberTextField}
                            selectionColor={Colors.background}
                            placeholder={"PHONE NUMBER"}
                            keyboardType={'phone-pad'}
                            returnKeyType="next"
                            autoCorrect={true}
                            autoCapitalize={"none"}
                            underlineColorAndroid={"transparent"}
                            clearButtonMode={'while-editing'}
                            value={state.phone}
                            style={{
                                height: 50,
                                flex: 1,
                                marginStart: 10,
                                backgroundColor: Colors.white,
                                borderRadius: 5,
                                paddingHorizontal: 15,
                                fontFamily: 'GothamCondensed-Book',
                                fontSize: 20
                            }}                        
                            onSubmitEditing={() => emailTextField.current.focus()}
                            onChangeText={(val) => setState(prevState => ({...prevState, phone: val}))}
                        />
                    </View>
                    <View style={{marginTop: 15}}>
                        <TextInput
                            ref={emailTextField}
                            selectionColor={Colors.background}
                            placeholder={"EMAIL"}
                            keyboardType="email-address"
                            returnKeyType="next"
                            autoCorrect={true}
                            autoCapitalize={"none"}
                            underlineColorAndroid={"transparent"}
                            clearButtonMode={'while-editing'}
                            value={state.email}
                            style={{
                                height: 50,
                                width: Layouts.screenWidth - 40,
                                backgroundColor: Colors.white,
                                borderRadius: 5,
                                paddingHorizontal: 15,
                                fontFamily: 'GothamCondensed-Book',
                                fontSize: 20
                            }}                        
                            onSubmitEditing={() => passwordTextField.current.focus()}
                            onChangeText={(val) => setState(prevState => ({...prevState, email: val.toLowerCase()}))}
                        />
                    </View>
                    <View style={{marginTop: 15}}>
                        <TextInput
                            ref={passwordTextField}
                            selectionColor={Colors.background}
                            placeholder={"PASSWORD"}
                            secureTextEntry={true}
                            returnKeyType='next'
                            autoCorrect={false}
                            autoCapitalize={"none"}
                            underlineColorAndroid={"transparent"}
                            clearButtonMode={'while-editing'}
                            value={state.password}
                            style={{
                                height: 50,
                                width: Layouts.screenWidth - 40,
                                backgroundColor: Colors.white,
                                borderRadius: 5,
                                paddingHorizontal: 15,
                                fontFamily: 'GothamCondensed-Book',
                                fontSize: 20
                            }}                        
                            onSubmitEditing={() => confirmPasswordTextField.current.focus()}
                            onChangeText={(val) => setState(prevState => ({...prevState, password: val}))}
                        />
                    </View>
                    <View style={{marginTop: 15}}>
                        <TextInput
                            ref={confirmPasswordTextField}
                            selectionColor={Colors.background}
                            placeholder={"RE-ENTER PASSWORD"}
                            secureTextEntry={true}
                            returnKeyType='done'
                            autoCorrect={false}
                            autoCapitalize={"none"}
                            underlineColorAndroid={"transparent"}
                            clearButtonMode={'while-editing'}
                            value={state.confirmPassword}
                            style={{
                                height: 50,
                                width: Layouts.screenWidth - 40,
                                backgroundColor: Colors.white,
                                borderRadius: 5,
                                paddingHorizontal: 15,
                                fontFamily: 'GothamCondensed-Book',
                                fontSize: 20
                            }}                        
                            onSubmitEditing={() => Keyboard.dismiss()}
                            onChangeText={(val) => setState(prevState => ({...prevState, confirmPassword: val}))}
                        />
                    </View>
                    <TouchableOpacity onPress={() => {
                        setState(prevState => ({...prevState, isReceiveEmail: !prevState.isReceiveEmail}))
                    }} style={{flexDirection: 'row', marginTop: 15, alignItems: 'center', alignSelf: 'flex-start', marginStart: 20}}>
                        <View style={{width: 30, height: 30, borderRadius: 5, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center'}}>
                            {state.isReceiveEmail && 
                                <Image source={require('../../assets/images/icon_check.png')} style={{width: 16, height: 16, tintColor: Colors.background}} resizeMode={'contain'} />
                            }
                        </View>
                        <Text style={{marginStart: 15, fontFamily: 'GothamCondensed-Medium', fontSize: 20, color: Colors.white}}>{'RECEIVE EMAIL NOTIFICATIONS'}</Text>
                    </TouchableOpacity>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20}}>
                        <TouchableOpacity onPress={() => signUpFirebase()} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.green, borderRadius: 30}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'CREATE YOUR NEW ACCOUNT'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

export default CreateAccountScreen;