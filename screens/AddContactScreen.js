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
    Modal,
    SafeAreaView,
    Alert,
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Fonts from '../constants/Fonts';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';
import ActionSheet from 'react-native-actionsheet'
import Functions from '../constants/Functions';
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';
import Contacts from 'react-native-contacts';
import { SearchableFlatList } from 'react-native-searchable-list'
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';

function AddContactScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        firstName: route.params.firstName == null ? '' : route.params.firstName,
        lastName: route.params.lastName == null ? '' : route.params.lastName,
        email: route.params.email == null ? '' : route.params.email,
        photo: undefined,
        isVisibleStartModal: false,
        loading: false,
        createdContact: undefined,
        isVisibleContactsModal: false,

        contactsToImport: [],
        keyword: '',
        searchTerm: '',
    })
    const firstNameTextField = useRef(null)
    const lastNameTextField = useRef(null)
    const emailTextField = useRef(null)
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
                    {'ADD A CONTACT'}
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
    function loadPhoneContacts() {
        if (Platform.OS == 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                    'title': 'PinkyPromise Would Like to Access Your Contacts',
                    'message': 'This will let you invite your friends from your contacts.',
                    'buttonPositive': 'OK'
                }
            ).then(() => {
                Contacts.getAll()
                    .then((contacts) => {
                        let phoneContacts = []
                        for (let index = 0; index < contacts.length; index++) {
                            const contact = contacts[index];
                            const info = getContactWithEmail(contact)
                            if (info != null) {
                                const phoneContact = {
                                    email: info.email,
                                    givenName: contact.givenName,
                                    familyName: contact.familyName,
                                    fullName: contact.givenName + ' ' + contact.familyName
                                }
                                phoneContacts.push(phoneContact)
                            }
                        }
                        setState(prevState => ({...prevState, contactsToImport: phoneContacts, isVisibleContactsModal: true}))
                    })
                    .catch((error) => {
                        if (error.message == 'denied') {
                            Alert.alert(
                                "PinkyPromise Would Like to Access Your Contacts",
                                'This will let you invite your friends from your contacts.',
                                [
                                    {
                                        text: "Don't Allow",
                                        style: 'default'
                                    },
                                    {
                                    text: 'OK',
                                        onPress: () => Linking.openSettings(),
                                        style: 'cancel'
                                    },
                                ],
                            );
                        } else {
                            console.log(error.message)
                        }
                    })
            })
        } else if (Platform.OS == 'ios') {
            Contacts.getAll()
                .then((contacts) => {
                    let phoneContacts = []
                    for (let index = 0; index < contacts.length; index++) {
                        const contact = contacts[index];
                        const info = getContactWithEmail(contact)
                        if (info != null) {
                            const phoneContact = {
                                email: info.email,
                                givenName: contact.givenName,
                                familyName: contact.familyName,
                                fullName: contact.givenName + ' ' + contact.familyName
                            }
                            phoneContacts.push(phoneContact)
                        }
                    }
                    setState(prevState => ({...prevState, contactsToImport: phoneContacts, isVisibleContactsModal: true}))
                })
                .catch((error) => {
                    if (error.message == 'denied') {
                        Alert.alert(
                            "PinkyPromise Would Like to Access Your Contacts",
                            'This will let you invite your friends from your contacts.',
                            [
                                {
                                    text: "Don't Allow",
                                    style: 'default'
                                },
                                {
                                text: 'OK',
                                    onPress: () => Linking.openSettings(),
                                    style: 'cancel'
                                },
                            ],
                        );
                    } else {
                        console.log(error.message)
                    }
                })
        }
    }
    function getContactWithPhone(phonContact) {
        let phone = ""
        for (let index = 0; index < phonContact.phoneNumbers.length; index++) {
            const phoneNumber = phonContact.phoneNumbers[index];
            if (phoneNumber.label == 'mobile' || phoneNumber.label == 'work' || phoneNumber.label == 'home' || phoneNumber.label == 'other') {
                phone = phoneNumber.number
                break
            } 
        }
        return { name: phonContact.givenName + ' ' + phonContact.familyName, phone: phone }
    }
    function getContactWithEmail(phonContact) {
        let email = ""
        for (let index = 0; index < phonContact.emailAddresses.length; index++) {
            const emailObject = phonContact.emailAddresses[index];
            if (emailObject.email != '' && emailObject.email != null) {
                email = emailObject.email
            }            
        }
        if (email == "") {
            return null
        } else {
            return { name: phonContact.givenName + ' ' + phonContact.familyName, email: email }
        }        
    }

    const ContactsModal = () => {
        return (
            <Modal visible={state.isVisibleContactsModal} transparent={true}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.8)'}}>
                    <SafeAreaView style={{flex: 1, alignItems: 'center'}}>                        
                        <View style={{width: Layouts.screenWidth - 50, flex: 1, marginVertical: 70, borderRadius: 8, paddingTop: 20, backgroundColor: 'white'}}>
                            <Text style={{textAlign: 'center', marginTop: 0, fontSize: 20, fontFamily: 'Gotham-Medium', color: Colors.blue}}>{'Select Contacts'}</Text>
                            <TouchableOpacity onPress={() => setState(prevState => ({...prevState, isVisibleContactsModal: false})) } style={{left: 20, position: 'absolute', top: 20}}>
                                <Image source={require('../assets/images/icon_close.png')} style={{resizeMode: 'contain', width: 18, height: 18}}/>
                            </TouchableOpacity>
                            <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 20, height: 44}}>
                                <View style={{flex: 1, flexDirection: 'row', paddingHorizontal: 10, alignItems: 'center', height: 44, borderRadius: 7, backgroundColor: 'rgba(216,216,216,0.2)'}}>
                                    {/* <Image source={require('../assets/images/tab_search.png')} style={{width: 24, height: 24}}/> */}
                                    <TextInput placeholder={'Search'} placeholderTextColor={Colors.text_light} style={{marginStart: 10, flex: 1, fontSize: 16, fontFamily: 'Gotham-Medium', color: Colors.text_dark}} onChangeText={(value) => setState(prevState => ({...prevState, keyword: value}))}></TextInput>
                                </View>
                            </View>
                            <SearchableFlatList
                                searchTerm={state.keyword}
                                searchAttribute={'fullName'}
                                ignoreCase={true}
                                data = {state.contactsToImport}
                                style={{flex: 1, width: '100%'}}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{paddingTop: 10, paddingBottom: 20}}
                                renderItem={({ item, index }) => 
                                    <TouchableOpacity onPress={() => {
                                        setState(prevState => ({...prevState, isVisibleContactsModal: false, firstName: item.givenName == undefined ? '' : item.givenName, lastName: item.familyName == undefined ? '' : item.familyName, email: item.email}))
                                    }} style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 55}}>
                                        {
                                            item.thumbnail == null ? 
                                            <View style={{width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.text, alignItems: 'center', justifyContent: 'center'}}>
                                                <Text style={{color: Colors.text, fontSize: 14, fontFamily: 'Gotham-Medium'}}>
                                                    {
                                                        (item.givenName == undefined ? item.fullName.substr(0, 1) : item.givenName.substr(0, 1).toUpperCase()) + (item.givenName == undefined ? item.fullName.substr(0, 1) : item.familyName.substr(0, 1).toUpperCase())
                                                    }
                                                </Text>
                                            </View> : 
                                            <Image source={{uri: item.thumbnail}} style={{width: 30, height: 30, borderRadius: 15}}/>
                                        }
                                        <View style={{marginStart: 10}}>
                                            {
                                                item.givenName != undefined  && 
                                                <Text style={{fontFamily: Fonts.GothamCondensedMedium, fontSize: 18, color: Colors.text}}>{item.givenName + ' ' + item.familyName}</Text>
                                            }
                                            <Text style={{fontFamily: Fonts.GothamCondensedBook, fontSize: 16, color: Colors.text}}>{item.email}</Text>
                                        </View>                                        
                                    </TouchableOpacity>
                                }
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        )
    }
    const UserStartModal = () => {
        return (
            <Modal visible={state.isVisibleStartModal} transparent={true} >
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)'}}>
                    <View style={{width: Layouts.screenWidth - 40, maxHeight: Layouts.screenHeight - 150, alignItems: 'center', paddingTop: 35, paddingBottom: 25, backgroundColor: "#5E6B85", borderRadius: 20, borderColor: "rgba(0, 0, 0, 0.1)"}}>
						<Text style={{color: "#fff", fontSize: 18, fontFamily: 'Gotham-Medium'}}>{"LET'S GET STARTED!"}</Text>
						<ScrollView style={{marginVertical: 20}} contentContainerStyle={{paddingHorizontal: 20}} showsVerticalScrollIndicator={false}>
							<Text style={{color: "#fff", textAlign: "left", fontSize: 16, fontFamily: 'Avenir-Light'}}>
								{'Select whether you are looking to make a new promise or promise made to me...'}
							</Text>
						</ScrollView>
                        <TouchableOpacity onPress={() => {
                            navigation.replace('MakeAPromise', {type: 'PROMISE', contact: state.createdContact})
						}} style={{marginTop: 0, flexDirection: 'row', width: Layouts.screenWidth - 80, height: 60, borderRadius: 30, backgroundColor: '#3E4D66', alignItems: 'center', justifyContent: 'center'}}>
                            <Image style={{position: 'absolute', left: 15, width: 36, height: 36, resizeMode: 'contain'}} source={require('../assets/images/icon_new_promise.png')} />
							<Text style={{marginStart: 15, color: Colors.white, fontFamily: Fonts.GothamMedium, fontSize: 14}}>{'MAKE A PROMISE'}</Text>
						</TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            navigation.replace('MakeAPromise', {type: 'REQUEST', contact: state.createdContact})
						}} style={{marginTop: 15, flexDirection: 'row', width: Layouts.screenWidth - 80, height: 60, borderRadius: 30, backgroundColor: '#3E4D66', alignItems: 'center', justifyContent: 'center'}}>
                            <Image style={{position: 'absolute', left: 15, width: 36, height: 36, resizeMode: 'contain'}} source={require('../assets/images/icon_new_promise_flip.png')} />
							<Text style={{marginStart: 15, color: Colors.white, fontFamily: Fonts.GothamMedium, fontSize: 14}}>{'PROMISE MADE TO ME'}</Text>
						</TouchableOpacity>
						<View style={{height: 1, marginTop: 25, backgroundColor: "#3B4A64", width: Layouts.screenWidth - 40}} />
						<TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, isVisibleStartModal: false}))
                            navigation.pop()
						}} style={{marginTop: 15, width: Layouts.screenWidth - 80, height: 60, borderRadius: 30, borderWidth: 2, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center'}}>
							<Text style={{color: Colors.white, fontFamily: Fonts.GothamMedium, fontSize: 14}}>{'CANCEL'}</Text>
						</TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
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
                    createContact(response.data.file)
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
    function createContact(photo) {
        const body = new FormData();
        body.append('userId', global.loggedInUser.id);
        body.append('email', state.email);
        body.append('phone', "");
        body.append('photo', photo);
        body.append('firstName', state.firstName);
        body.append('lastName', state.lastName);
        
        axios.post('apis/create_contact/', body)
            .then(function (response) {
                setState(prevState => ({...prevState, loading: false}))
                setTimeout(() => {
                    setState(prevState => ({...prevState, isVisibleStartModal: true, createdContact: response.data.contact}))
                    // Functions.shared().showErrorMessage("Success", "You've added the contact successfully.", "OK")
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
    function onAddClicked() {
        Keyboard.dismiss()

        if (state.firstName == '') {
            Functions.shared().showErrorMessage("Add Contact Error", "Please enter a first name.", "Try again")
            return;
        } else if (state.lastName == '') {
            Functions.shared().showErrorMessage("Add Contact Error", "Please enter a last name.", "Try again")
            return;
        } else if (!Functions.shared().isValidEmailAddress(state.email)) {
            Functions.shared().showErrorMessage("Add Contact Error", "Please enter a valid email address.", "Try again")
            return;
        }
        if (state.photo == undefined) {
            setState(prevState => ({...prevState, loading: true}))
            createContact('user_photo_placeholder.png')
        } else {
            uploadPhoto()
        }
    }
    async function checkGoogleIsSignedIn() {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser == null) {
            loginGoogle()
        } else {
            const { idToken, accessToken } = await GoogleSignin.getTokens();
            loadGoogleContacts(accessToken)
        }
    }
    async function loginGoogle() {
        try {
            GoogleSignin.configure({
                scopes: [
                    "https://www.google.com/m8/feeds/",
                    "https://www.googleapis.com/auth/contacts.readonly",
                    "https://www.googleapis.com/auth/contacts.other.readonly",
                    "https://www.googleapis.com/auth/profile.emails.read",
                    "https://www.googleapis.com/auth/user.emails.read",
                    "https://www.googleapis.com/auth/userinfo.email",
                ],                        
                // webClientId: '<WEB_CLIENT_ID>',
                // offlineAccess: false,
                // hostedDomain: '',
                // forceConsentPrompt: true, 
                // accountName: '',
            });
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });            
            await GoogleSignin.signIn();
            const { idToken, accessToken } = await GoogleSignin.getTokens();
            loadGoogleContacts(accessToken)
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
    var defaultheader = function () {
        return {
            method: null,
            body: null,
            crossDomain: true,
            cache: false,
            async: false,
            timeout: 3000,
            headers: {
                "Content-Type": "application/json",
                "Authorization":"",
                "Accept": "*/*",
                "Access-Control-Allow-Headers":"*",
                "Access-Control-Allow-Headers":"*",
                "X-Requested-With":"XMLHttpRequest"
            },
        };
    };
    function transformRequest(obj){
        var str = [];
        for (var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    }
    function loadGoogleContacts(accessToken) {
        const header = defaultheader();
        let params = {
            // "alt": "json",
            // "max-results": 100
        };
        header.method = 'GET';
        // let url = "https://www.google.com/m8/feeds/contacts/default/full?";
        // let url = "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses";
        let url = "https://people.googleapis.com/v1/otherContacts?readMask=names,emailAddresses";        
        var suburl = transformRequest(params);
        url = url + suburl;
        header.headers["Authorization"] = 'Bearer ' + accessToken;
        fetch(url, header)
            .then((response) => {
                setTimeout(() => {                    
                }, 0); 
                return response.json()
            })
            .then((responseJson) => {
                const googleContacts = []
                responseJson.otherContacts.forEach(contact => {
                    var googleContact = {
                        email: contact.emailAddresses[0].value
                    }
                    if (contact.names != undefined) {
                        googleContact['givenName'] = contact.names[0].givenName
                        googleContact['familyName'] = contact.names[0].familyName
                        googleContact['fullName'] = contact.names[0].givenName + ' ' + contact.names[0].familyName
                    } else {
                        googleContact['fullName'] = contact.emailAddresses[0].value                        
                    }
                    googleContacts.push(googleContact)
                });
                setState(prevState => ({...prevState, contactsToImport: googleContacts, isVisibleContactsModal: true}))
            })
            .catch((error) => {
                console.log("An error occurred.Please try again", error);
            });
    }
    return (
        <View style={{flex: 1, alignItems: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Adding...'}/>
            {UserStartModal()}
            { state.isVisibleContactsModal && ContactsModal() }
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
            <SafeAreaView style={{flex: 1}}>
                <View style={{alignItems: 'center', flex: 1}}>
                    <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{flex: 1}} style={{flex: 1}} scrollEnabled={false}>
                        <View style={{flexDirection: 'row', marginTop: 20, alignItems: 'center', justifyContent: 'space-between', width: Layouts.screenWidth - 40}}>
                            <Image style={{width: 60, height: 60, borderRadius: 30}} source={state.photo == undefined ? require('../assets/images/icon_contact.png') : {uri: state.photo.path}} />
                            <TouchableOpacity onPress={() => photoActionSheet.current.show()} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 115, height: 60, backgroundColor: Colors.text_light, borderRadius: 30}}>
                                <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.text}}>{'UPLOAD A PHOTO'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginTop: 25}}>
                            <TextInput
                                ref={firstNameTextField}
                                selectionColor={Colors.background}
                                placeholder={"FIRST NAME"}
                                keyboardType={'default'}
                                returnKeyType='next'
                                autoCorrect={true}
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
                                returnKeyType='next'
                                autoCorrect={true}
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
                                onSubmitEditing={() => emailTextField.current.focus()}
                                onChangeText={(val) => setState(prevState => ({...prevState, lastName: val}))}
                            />
                        </View>
                        <View style={{marginTop: 10}}>
                            <TextInput
                                ref={emailTextField}
                                selectionColor={Colors.background}
                                placeholder={"EMAIL ADDRESS"}
                                keyboardType={'email-address'}
                                returnKeyType='done'
                                autoCorrect={true}
                                autoCapitalize={"none"}
                                underlineColorAndroid={"transparent"}
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
                                onSubmitEditing={() => Keyboard.dismiss()}
                                onChangeText={(val) => setState(prevState => ({...prevState, email: val}))}
                            />
                        </View>
                        <TouchableOpacity onPress={() => {
                            onAddClicked()
                        }} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.primary_dark, borderRadius: 30, marginTop: 20}}>
                            <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'ADD CONTACT'}</Text>
                        </TouchableOpacity>
                        <View style={{flex: 1, justifyContent: 'flex-end', paddingBottom: 20}}>
                            <TouchableOpacity onPress={() => {
                                loadPhoneContacts()
                            }} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.green, borderRadius: 30, marginTop: 10}}>
                                <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'INVITE YOUR PHONE CONTACTS'}</Text>
                            </TouchableOpacity>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                                {/* <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center', width: (Layouts.screenWidth - 50) / 2, height: 60, backgroundColor: Colors.facebook, borderRadius: 30}}>
                                    <Image resizeMode={'contain'} source={require('../assets/images/img_facebook.png')} style={{position: 'absolute', left: 10, width: 30, height: 30, tintColor: Colors.primaryColor}} />
                                    <Text style={{marginStart: 25, fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'FACEBOOK'}</Text>
                                </TouchableOpacity> */}
                                <TouchableOpacity onPress={() => {
                                    checkGoogleIsSignedIn()
                                }} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.white, borderRadius: 30}}>
                                    <Image resizeMode={'contain'} source={require('../assets/images/icon_google.png')} style={{position: 'absolute', left: 20, width: 30, height: 30, tintColor: Colors.primaryColor}} />
                                    <Text style={{marginStart: 35, fontFamily: 'Gotham-Medium', fontSize: 14, color: '#EA4335'}}>{'INVITE GOOGLE CONCTACTS'}</Text>
                                </TouchableOpacity>
                            </View>
                            {/* <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.text_light, borderRadius: 30, marginTop: 10}}>
                                <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.text}}>{'INVITE CONTACTS VIA EMAIL'}</Text>
                            </TouchableOpacity> */}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default AddContactScreen;