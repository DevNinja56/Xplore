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

import * as firebase from 'firebase';
import axios from 'axios';
import Functions from '../constants/Functions';
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';

function ChangePasswordScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const currentPasswordTextField = useRef(null)
    const newPasswordTextField = useRef(null)
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
                    {'CHANGE PASSWORD'}
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
                    updatePassword()
                }} style={{marginEnd: 15}}>
                    <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'SAVE'}
                    </Text>
                </TouchableOpacity>
            )
        })
    })
    function reauthenticate(password) {
        var user = firebase.auth().currentUser;
        var credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        return user.reauthenticateWithCredential(credential);
    }
    function updatePassword() {
        Keyboard.dismiss()

        if (state.currentPassword == '') {
            Functions.shared().showErrorMessage('Change Password Error', "Please enter your current password.", 'Try again')
            return
        }
        if (state.newPassword == '') {
            Functions.shared().showErrorMessage('Change Password Error', "Please enter your new password.", 'Try again')
            return;
        } 
        if (state.confirmPassword != state.newPassword) {
            Functions.shared().showErrorMessage("Change Password Error", "Password and confirm password does not match.", "Try again")
            return;
        }

        setState(prevState => ({...prevState, loading: true}))
        reauthenticate(state.currentPassword)
            .then(() => {
                let firebaseUser = firebase.auth().currentUser;
                firebaseUser.updatePassword(state.newPassword)
                    .then(() => {
                        setState(prevState => ({...prevState, loading: false, currentPassword: '', newPassword: '', confirmPassword: ''}))
                        Functions.shared().showErrorMessage('Success', "Your password has been successfully updated.", 'OK')
                    }).catch((error) => { 
                        setState(prevState => ({...prevState, loading: false}))
                    });
            })
            .catch((error) => { 
                console.log(error)
                setState(prevState => ({...prevState, loading: false}))
                Functions.shared().showErrorMessage("Change Password Error", error.message, "Try again")
            });
    }
    return (
        <View style={{flex: 1, alignItems: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Updating...'}/>
            <ScrollView showsVerticalScrollIndicator={false} style={{width: Layouts.screenWidth}} contentContainerStyle={{paddingHorizontal: 0, paddingTop: 10, paddingBottom: 20, alignItems: 'center'}}>
                <View style={{marginTop: 10}}>
                    <TextInput
                        ref={currentPasswordTextField}
                        selectionColor={Colors.background}
                        placeholder={"CURRENT PASSWORD"}
                        secureTextEntry={true}
                        returnKeyType='next'
                        autoCorrect={false}
                        autoCapitalize={"none"}
                        underlineColorAndroid={"transparent"}
                        clearButtonMode={'while-editing'}
                        value={state.currentPassword}
                        style={{
                            height: 50,
                            width: Layouts.screenWidth - 40,
                            backgroundColor: Colors.white,
                            borderRadius: 5,
                            paddingHorizontal: 15,
                            fontFamily: 'GothamCondensed-Book',
                            fontSize: 20
                        }}
                        onSubmitEditing={() => newPasswordTextField.current.focus()}
                        onChangeText={(val) => setState(prevState => ({...prevState, currentPassword: val}))}
                    />
                </View>
                <View style={{marginTop: 10}}>
                    <TextInput
                        ref={newPasswordTextField}
                        selectionColor={Colors.background}
                        placeholder={"NEW PASSWORD"}
                        secureTextEntry={true}
                        returnKeyType='next'
                        autoCorrect={false}
                        autoCapitalize={"none"}
                        underlineColorAndroid={"transparent"}
                        clearButtonMode={'while-editing'}
                        value={state.newPassword}
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
                        onChangeText={(val) => setState(prevState => ({...prevState, newPassword: val}))}
                    />
                </View>
                <View style={{marginTop: 10}}>
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
            </ScrollView>
        </View>
    )
}

export default ChangePasswordScreen;