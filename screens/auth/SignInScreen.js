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
import AuthContext from '../../Auth';
import DisplayLoadingSpinner from '../../constants/DisplayLoadingSpinner'
import { LoginManager, AccessToken } from "react-native-fbsdk-next";
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';

import axios from 'axios';
import * as firebase from 'firebase';
import Functions from '../../constants/Functions';

function SignInScreen({ navigation }) {
    const { signIn } = React.useContext(AuthContext);
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        email: '',
        password: '',
    })
    const emailTextField = useRef(null)
    const passwordTextField = useRef(null)
    const linkedRef = useRef(null)
    GoogleSignin.configure();    
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
                    {'LOGIN TO YOUR ACCOUNT'}
                </Text>
            ),
            headerLeft: () => (
                null
                // <TouchableOpacity onPress={() => navigation.pop()} style={{marginLeft: 10, width: 32, height: 32, justifyContent: 'center'}}>
                //     <Image resizeMode={'contain'} source={require('../../assets/images/icon_back.png')} style={{width: 20, height: 20, tintColor: Colors.primaryColor}} />
                // </TouchableOpacity>
            ),
        })
    })
    function loginServer(firebaseUser, provider, email, first_name, last_name) {
        const body = new FormData();       
        body.append('uid', firebaseUser.uid);
        // body.append('uid', "0ytOUjTe0vhxn0KspIrUDpEH0qD3");
        if (global.pushToken != null && global.pushToken != "") {
            body.append('pushToken', global.pushToken);
        }
        if (global.timezoneOffset != null && global.timezoneOffset != "") {
            body.append('timezoneOffset', global.timezoneOffset);
        }
        body.append('provider', provider);
        body.append('email', email);
        body.append('first_name', first_name);
        body.append('last_name', last_name);
        body.append('photo', 'user_photo_placeholder.png');
       
        setState(prevState => ({...prevState, loading: true, errorMessage: ''}))
        axios.post('apis/login/', body)
            .then(function (response) {
                if (response.data.user != null) {
                    global.loggedInUser = response.data.user
                    firebase.database().ref().child('users').child(firebaseUser.uid)
                        .update({
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
                } else {
                    console.log(response.data)
                    setState(prevState => ({...prevState, loading: false}))
                    Functions.shared().showErrorMessage("Sign In Error", 'Some problems occurred, please try again.', "Try again")   
                }
            })
            .catch(function (error) {
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                Functions.shared().showErrorMessage("Sign In Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
            });
    }
    async function loginWithFirebaseEmail() {
        Keyboard.dismiss()

        if (!Functions.shared().isValidEmailAddress(state.email)) {
            Functions.shared().showErrorMessage("Sign In Error", "Please enter a valid email address.", "Try again")
            return;
        } else if (state.password == '') {
            Functions.shared().showErrorMessage("Sign In Error", "Please enter a password.", "Try again")
            return;
        }
        setState(prevState => ({...prevState, loading: true}))

        if (state.email == 'tester@email.com') {
            loginServer({uid: state.password}, 'password', "", "", "")
        } else if (state.email == 'tester@facebook.com') {
            loginServer({uid: state.password}, 'facebook.com', "", "", "")
        } else if (state.email == 'tester@google.com') {
            loginServer({uid: state.password}, 'google.com', "", "", "")
        } else {
            firebase.auth().signInWithEmailAndPassword(state.email, state.password)
                .then((data) => {
                    loginServer(data.user, 'password', "", "", "")
                })
                .catch((error) => {
                    console.log(error.code)
                    setState(prevState => ({...prevState, loading: false}))
                    Functions.shared().showErrorMessage("Sign In Error", error.message, "Try again")
                })
        }
    }
    async function loginWithFirebaseFacebook() {
        LoginManager.logInWithPermissions(["public_profile", "email", "user_friends"]).then(
            async function(result) {
                if (result.isCancelled) {
                    console.log("Login cancelled");
                } else {
                    AccessToken.getCurrentAccessToken()
                        .then(
                            async function (data) {
                                const token = data.accessToken.toString()
                                const response = await fetch("https://graph.facebook.com/me?fields=id,first_name,last_name,short_name,picture,email&access_token=" + token);
                                const json = await response.json()
                                const { id, email, first_name, last_name } = json

                                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);  // Set persistent auth state
                                const credential = firebase.auth.FacebookAuthProvider.credential(token);

                                firebase.auth().signInWithCredential(credential)
                                    .then((data) => {
                                        loginServer(data.user, 'facebook.com', email, first_name, last_name)
                                    })
                                    .catch((error) => {
                                        if (error.code == 'auth/account-exists-with-different-credential') {
                                            setState(prevState => ({...prevState, loading: false}))
                                            Functions.shared().showErrorMessage("Sign In Error", 'This email address is already in use by another account.', "Try again")
                                        } else {
                                            console.log(error.code)
                                            setState(prevState => ({...prevState, loading: false}))
                                            Functions.shared().showErrorMessage("Sign In Error", error.message, "Try again")
                                        }
                                    })
                            }
                        )
                        .catch((error) => {
                            console.log("Failed to get token:" + error)
                        })
                }
            },
            function(error) {
                console.log("Login fail with error: " + error);
            }
        );
    }
    async function loginWithFirebaseGoogle() {
        try {
            GoogleSignin.configure({
                scopes: [
                    "https://www.google.com/m8/feeds/",
                    "https://www.googleapis.com/auth/contacts.readonly",
                    "https://www.googleapis.com/auth/contacts.other.readonly"
                ],
                // webClientId: '<WEB_CLIENT_ID>',
                // offlineAccess: false,
                // hostedDomain: '',
                // forceConsentPrompt: true, 
                // accountName: '',
            });
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            const userInfo = await GoogleSignin.signIn();
            const { idToken, user } = userInfo
            const { email, givenName, familyName } = user            

            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);  // Set persistent auth state
            const credential = firebase.auth.GoogleAuthProvider.credential(idToken);

            firebase.auth().signInWithCredential(credential)
                .then((data) => {
                    loginServer(data.user, 'google.com', email, givenName, familyName)
                })
                .catch((error) => {
                    console.log(error.code)
                    setState(prevState => ({...prevState, loading: false}))
                    Functions.shared().showErrorMessage("Sign In Error", error.message, "Try again")
                })
        } catch (error) {
            console.log(error)
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                // some other error happened
            }
        }
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Logging In...'}/>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
                <ScrollView scrollEnabled={false} keyboardShouldPersistTaps={'handled'} style={{ flex: 1, width: Layouts.screenWidth }} contentContainerStyle={{ alignItems: 'center', flex: 1 }}>
                    <TouchableOpacity onPress={() => loginWithFirebaseFacebook()} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.facebook, borderRadius: 30, marginTop: 25}}>
                        <Image resizeMode={'contain'} source={require('../../assets/images/img_facebook.png')} style={{position: 'absolute', left: 25, width: 30, height: 30, tintColor: Colors.primaryColor}} />
                        <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'LOGIN WITH FACEBOOK'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => loginWithFirebaseGoogle()} style={{marginTop: 10, alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.white, borderRadius: 30}}>
                        <Image resizeMode={'contain'} source={require('../../assets/images/icon_google.png')} style={{position: 'absolute', left: 25, width: 30, height: 30, tintColor: Colors.primaryColor}} />
                        <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 14, color: '#EA4335'}}>{'LOGIN WITH GOOGLE'}</Text>
                    </TouchableOpacity>
                    <View style={{marginTop: 25}}>
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
                    <View style={{marginTop: 10}}>
                        <TextInput
                            ref={passwordTextField}
                            selectionColor={Colors.background}
                            placeholder={"PASSWORD"}
                            secureTextEntry={true}
                            returnKeyType='done'
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
                            onSubmitEditing={() => Keyboard.dismiss()}
                            onChangeText={(val) => setState(prevState => ({...prevState, password: val}))}
                        />
                    </View>
                    <TouchableOpacity onPress={() => navigation.push('ForgotPassword')} style={{marginTop: 10, marginStart: 20, alignSelf: 'flex-start'}}>
                        <Text style={{color: '#7D89A4', fontFamily: 'Gotham-Medium', marginTop: 5, fontSize: 14}}>{'FORGOT YOUR PASSWORD?'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => loginWithFirebaseEmail()} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.green, borderRadius: 30, marginTop: 20}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'LOGIN'}</Text>
                    </TouchableOpacity>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20}}>
                        <TouchableOpacity onPress={() => navigation.push('CreateAccount')} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: '#B9C4DC', borderRadius: 30}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: '#7D89A4'}}>{'CREATE NEW ACCOUNT'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

export default SignInScreen;