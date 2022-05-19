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
    TextInput,
    Keyboard,
    SafeAreaView,
    Alert,
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';
import ActionSheet from 'react-native-actionsheet'
import Functions from '../constants/Functions';
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';

function EditContactScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        firstName: route.params.contact.firstName,
        lastName: route.params.contact.lastName,
        email: route.params.contact.email,
        photo: {
            path: route.params.contact.photo
        },
        loading: false,
    })
    const firstNameTextField = useRef(null)
    const lastNameTextField = useRef(null)
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
                    {'EDIT CONTACT'}
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
        setState(prevState => ({...prevState, photo: image}))
    }
    function deleteContact() {
        setState(prevState => ({...prevState, loading: true}))
        axios.delete('apis/delete_contact/' + route.params.contact.id)
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
    function updateContact(photo) {
        const parameters = {
            'firstName': state.firstName,
            'lastName': state.lastName,
            'photo': photo,
        }
        var body = [];
        for (let property in parameters) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(parameters[property]);
            body.push(encodedKey + "=" + encodedValue);
        }
        body = body.join("&");

        setState(prevState => ({...prevState, loading: true}))
        axios.put('apis/update_contact/' + route.params.contact.id, body)
            .then(function (response) {
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    navigation.pop()
                }, 100)
            })
            .catch(function (error) {
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function uploadPhoto() {
        const body = new FormData();
        body.append('file', Platform.select({
            ios: {
                name: state.email + '_contact.jpg',
                uri: state.photo.path.replace('file://', ''),
            },
            android: {
                name: state.email + '_contact.jpg',
                type: state.photo.mime,
                size: state.photo.size,
                uri: state.photo.path,
            },
            default: {
                name: state.email + '_contact.jpg',
                uri: state.photo.path.replace('file://', ''),
            }
        }))
        
        setState(prevState => ({...prevState, loading: true, errorMessage: ''}))
        axios.post('upload/upload_file/', body)
            .then(function (response) {
                if (response.data.success == true) {
                    updateContact(response.data.file)
                } else {
                    setState(prevState => ({...prevState, loading: false}))
                    setTimeout(() => {
                        Functions.shared().showErrorMessage("Upload Error", error.response.data.message, "Try again")
                    }, 100)
                }
            })
            .catch(function (error) {
                console.error(error)
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    Functions.shared().showErrorMessage("Network Error", error.response.data == undefined ? 'Some problems occurred, please try again.' : error.response.data, "Try again")
                }, 100)
            });
    }
    function onRemoveClicked() {
        Alert.alert(
            "Remove",
            "Are you sure you want to remove this contact?",
            [
                {
                    text: "No",
                    style: "cancel"
                },
                {   
                    text: "Yes", 
                    onPress: () => {
                        deleteContact()
                    }
                }
            ]
        );
    }
    function onUpdateClicked() {
        Keyboard.dismiss()

        if (state.firstName == '') {
            Functions.shared().showErrorMessage("Add Contact Error", "Please enter a first name.", "Try again")
            return;
        } else if (state.lastName == '') {
            Functions.shared().showErrorMessage("Add Contact Error", "Please enter a last name.", "Try again")
            return;
        }
        if (state.photo.mime == undefined) {
            setState(prevState => ({...prevState, loading: true}))
            updateContact(state.photo.path)
        } else {
            uploadPhoto()
        }
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Processing...'}/>
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
            <SafeAreaView>
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{alignItems: 'center', flex: 1, paddingBottom: 25, width: Layouts.screenWidth, paddingHorizontal: 20 }}>
                    <TouchableOpacity onPress={() => photoActionSheet.current.show()} style={{marginTop: 25}}>
                        <Image style={{backgroundColor: Colors.gray_lighter, width: Layouts.screenWidth / 3, height: Layouts.screenWidth / 3}} source={{uri: state.photo.mime == undefined ? global.uploadURL + state.photo.path : state.photo.path}} />
                    </TouchableOpacity>
                    <View style={{marginTop: 25}}>
                        <TextInput
                            ref={firstNameTextField}
                            selectionColor={Colors.background}
                            placeholder={"FIRST NAME"}
                            keyboardType={'default'}
                            returnKeyType='next'
                            autoCorrect={false}
                            underlineColorAndroid={"transparent"}
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
                            keyboardType={'default'}
                            returnKeyType='done'
                            autoCorrect={false}
                            underlineColorAndroid={"transparent"}
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
                            onSubmitEditing={() => Keyboard.dismiss()}
                            onChangeText={(val) => setState(prevState => ({...prevState, lastName: val}))}
                        />
                    </View>
                    <View style={{paddingTop: 15, width: '100%'}}>
                        <Text style={{fontSize: 16, color: Colors.white, fontFamily: 'Gotham-Medium'}}>
                            {state.email}
                        </Text>
                    </View>
                    <View style={{flex: 1, justifyContent: 'flex-end'}}>
                        <TouchableOpacity onPress={() => onRemoveClicked()} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 50, backgroundColor: Colors.transparent, borderWidth: 2, borderColor: Colors.white, borderRadius: 30}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'REMOVE CONTACT'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onUpdateClicked()} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.green, borderRadius: 30, marginTop: 15}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'UPDATE CONTACT'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

export default EditContactScreen;