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

function EditEmailScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        email: global.loggedInUser.email,
        newEmail: ''
    })
    const emailTextField = useRef(null)
    const newEmailTextField = useRef(null)
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
                    {'EDIT YOUR EMAIL'}
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
                    updateEmail()
                }} style={{marginEnd: 15}}>
                    <Text style={{fontSize: 16, color: Colors.text_light, alignSelf: 'center', fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                        {'SAVE'}
                    </Text>
                </TouchableOpacity>
            )
        })
    })
    reauthenticate = (password) => {
        var user = firebase.auth().currentUser;
        var credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        return user.reauthenticateWithCredential(credential);
    }
    function updateEmail() {
        Keyboard.dismiss()

        if (!Functions.shared().isValidEmailAddress(state.newEmail)) {
            Functions.shared().showErrorMessage("Update Email Error", "Please enter a valid email address.", "Try again")
            return;
        }

        setState(prevState => ({...prevState, loading: true, errorMessage: ''}))
        reauthenticate(state.password)
            .then(() => {
                let user = firebase.auth().currentUser;
                user.updateEmail(state.newEmail)
                    .then(() => {
                        setState(prevState => ({...prevState, loading: false, password: '', newEmail: ''}))
                        Functions.shared().showErrorMessage('Success', "Your email has been successfully updated.", 'OK')
                    })
                    .catch((error) => { 
                        setState(prevState => ({...prevState, loading: false, errorMessage: error.message}))
                    });
            })
            .catch((error) => { 
                setState(prevState => ({...prevState, loading: false, errorMessage: error.message}))
            });

        const parameters = {
            'email': state.newEmail,
        }

        var body = [];
        for (let property in parameters) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(parameters[property]);
            body.push(encodedKey + "=" + encodedValue);
        }
        body = body.join("&");

        setState(prevState => ({...prevState, loading: true}))
        axios.put('/apis/user_update/' + global.loggedInUser.id, body)
            .then(function (response) {
                global.loggedInUser.email = state.newEmail

                Functions.shared().showErrorMessage('Success', "Your email has been successfully updated.", 'OK')
                setState(prevState => ({...prevState, loading: false, email: state.newEmail, newEmail: ''}))                
            })
            .catch(function (error) {
                setState(prevState => ({...prevState, loading: false}))
                Functions.shared().showErrorMessage('Update Email Error', error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, 'Try again')
            });
    }
    return (
        <View style={{flex: 1, alignItems: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Updating...'}/>
            <ScrollView showsVerticalScrollIndicator={false} style={{width: Layouts.screenWidth}} contentContainerStyle={{paddingHorizontal: 0, paddingTop: 10, paddingBottom: 20, alignItems: 'center'}}>
                <View style={{marginTop: 10}}>
                    <TextInput
                        ref={emailTextField}
                        editable={false}
                        selectionColor={Colors.background}
                        placeholder={"YOUR EMAIL"}
                        keyboardType="email-address"
                        returnKeyType="next"
                        autoCorrect={false}
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
                        onSubmitEditing={() => newEmailTextField.current.focus()}
                        onChangeText={(val) => setState(prevState => ({...prevState, email: val.toLowerCase()}))}
                    />
                </View>
                <View style={{marginTop: 10}}>
                    <TextInput
                        ref={newEmailTextField}
                        selectionColor={Colors.background}
                        placeholder={"NEW EMAIL"}
                        keyboardType="email-address"
                        returnKeyType="next"
                        autoCorrect={false}
                        autoCapitalize={"none"}
                        underlineColorAndroid={"transparent"}
                        clearButtonMode={'while-editing'}
                        value={state.newEmail}
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
                        onChangeText={(val) => setState(prevState => ({...prevState, newEmail: val.toLowerCase()}))}
                    />
                </View>
            </ScrollView>
        </View>
    )
}

export default EditEmailScreen;