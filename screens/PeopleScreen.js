import React, { useEffect, useLayoutEffect, useState } from 'react';
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
    Linking,
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Fonts from '../constants/Fonts';
import axios from 'axios';
import Functions from '../constants/Functions';
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';
import Contacts from 'react-native-contacts';
import { SearchableFlatList } from 'react-native-searchable-list'
import { GraphRequest, GraphRequestManager, LoginManager, AccessToken, AuthenticationToken } from 'react-native-fbsdk-next';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';

function PeopleScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        keyword: '',
        contacts: [],
        recentContacts: [],
        selectedContact: null,
        loading: false,
        isDataLoaded: false,
        isVisibleContactsModal: false,
        refreshing: false,

        contactsToImport: [],
        keyword: '',
        searchTerm: '',
    })
    useEffect(() => {
        loadContacts()
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
                    {'PEOPLE'}
                </Text>
            ),
            headerLeft: () => (
                null
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    navigation.push('AddContact', {})
                }} style={{marginRight: 15}}>
                    <Image source={require('../assets/images/icon_add_contact.png')} style={{width: 27, height: 30, resizeMode: 'contain'}} />
                </TouchableOpacity>
            )
        })
    })    
    function loadContacts() {
        setState(prevState => ({...prevState, loading: true, refreshing: false}))
        axios.get('apis/load_contacts', {
            params: {
                userId: global.loggedInUser.id,
            }
        })
        .then(function (response) {
            const sortedContacts = response.data.users.sort(function(a, b) { return a.userId == global.loggedInUser.id ? -1 : b.userId == global.loggedInUser.id ? 1 : 0; });
            const sortedRecentContacts = response.data.users.sort(function(a, b) { return a.userId == global.loggedInUser.id ? -1 : b.userId == global.loggedInUser.id ? 1 : 0; });

            setState(prevState => ({...prevState, loading: false, refreshing: false, isDataLoaded: true, contacts: sortedContacts, recentContacts: sortedRecentContacts}))
            // setState(prevState => ({...prevState, loading: false, refreshing: false, isDataLoaded: true, contacts: [], recentContacts: []}))
        })
        .catch(function (error) {
            console.log(error)
            setState(prevState => ({...prevState, loading: false, refreshing: false, isDataLoaded: true}))
            setTimeout(() => {
                Functions.shared().showErrorMessage("Network Error", (error.response == undefined || error.response.data == undefined) ? 'Some problems occurred. please try again.' : error.response.data, "Try again")
            }, 100)
        });
    }
    const ContactUserItem = (contact, index) => {
        return (
            <TouchableOpacity key={index.toString()} onPress={() => {
                setState(prevState => ({...prevState, selectedContact: contact}))
            }} style={{flexDirection: 'row', alignItems: 'center', width: Layouts.screenWidth, paddingHorizontal: 20}}>
                <View>
                    <Image source={{uri: global.uploadURL + (contact.userId == global.loggedInUser.id ? global.loggedInUser.photo : contact.photo)}} style={{backgroundColor: Colors.gray_lighter, width: 40, height: 40, borderRadius: 20}} />
                </View>
                <Text style={{marginStart: 10, fontSize: 16, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                    {contact.userId == global.loggedInUser.id ? ('MYSELF') : (contact.firstName.toUpperCase() + ' ' + contact.lastName.toUpperCase())}
                </Text>
            </TouchableOpacity>
        )
    }
    const RecentUserItem = (contact, index) => {
        return (
            <TouchableOpacity key={index.toString()} onPress={() => {
                setState(prevState => ({...prevState, selectedContact: contact}))
            }} style={{alignItems: 'center', marginStart: index == 0 ? 5 : 15}}>
                <View >
                    <Image source={{uri: global.uploadURL + (contact.userId == global.loggedInUser.id ? global.loggedInUser.photo : contact.photo)}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                </View>
                <Text style={{marginTop: 5, fontSize: 16, color: Colors.white, fontFamily: 'GothamCondensed-Medium'}}>
                    {contact.userId == global.loggedInUser.id ? 'MYSELF' : contact.firstName.toUpperCase()}
                </Text>
            </TouchableOpacity>
        )
    }
    const RecentView = () => {
        return (
            <View style={{alignItems: 'center'}}>
                <View style={{width: Layouts.screenWidth, paddingHorizontal: 15, borderBottomWidth: 0, borderBottomColor: Colors.black}}>
                    {
                        state.recentContacts.length > 0 && 
                        <Text style={{fontSize: 16, color: Colors.white, fontFamily: 'Gotham-Medium', justifyContent: 'center'}}>
                            {'RECENT USERS'}
                        </Text>
                    }
                    {
                        state.recentContacts.length > 0 && 
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{width: Layouts.screenWidth, paddingVertical: 15}}>
                            {
                                state.recentContacts.map((contact, index) => 
                                    RecentUserItem(contact, index)
                                )
                            }
                        </ScrollView>
                    }
                </View>
                <TextInput
                    selectionColor={Colors.background}
                    placeholder={"Search my contacts..."}
                    keyboardType={'default'}
                    returnKeyType={'search'}
                    autoCorrect={false}
                    autoCapitalize={"none"}
                    underlineColorAndroid={"transparent"}
                    value={state.keyword}
                    style={{
                        height: 44,
                        width: Layouts.screenWidth - 40,
                        backgroundColor: Colors.white,
                        borderRadius: 5,
                        paddingHorizontal: 15,
                        fontFamily: 'GothamCondensed-Book',
                        fontSize: 20,
                        marginTop: state.recentContacts.length > 0 ? 5 : 0,
                        marginBottom: 15,
                    }}                        
                    onSubmitEditing={() => Keyboard.dismiss()}
                    onChangeText={(val) => setState(prevState => ({...prevState, keyword: val.toLowerCase()}))}
                />
            </View>
        )
    }
    function _responseInfoCallback(error, result) {
        if (error) {
            console.log('failed to fetch friends');
            console.log(error)
        } else {
            console.log('success to ftech friends');
            console.log(result)
        }
    }
    function checkAuthenticationStatus() {
        if (Platform.OS === 'ios') {
            AuthenticationToken.getAuthenticationTokenIOS()
                .then((data) => {
                    if (data != null) {
                        loadFacebookFriends(data.authenticationToken)
                    } else {
                        loginFacebook()
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } else {
            AccessToken.getCurrentAccessToken()
                .then((data) => {
                    if (data != null) {
                        loadFacebookFriends(data.accessToken.toString())
                    } else {
                        loginFacebook()
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }
    function loginFacebook() {
        LoginManager.logInWithPermissions(["public_profile", "email", "user_friends"]).then(
            async function(result) {
                if (result.isCancelled) {
                    console.log("Login cancelled");
                } else {
                    checkAuthenticationStatus()
                }
            },
            function(error) {
                console.log("Login fail with error: " + error);
            }
        );
    }
    function loadFacebookFriends(token) {
        const infoRequest = new GraphRequest(
            '/me/invitable_friends',
            null,
            _responseInfoCallback,
        );
        new GraphRequestManager().addRequest(infoRequest).start();
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
    const EmptyView = () => {
        return (
            <View style={{alignItems: 'center', flex: 1}}>
                {
                    state.contacts.length == 0 && 
                    <Text style={{marginTop: 25, textAlign: 'center', fontSize: 16, lineHeight: 22, color: Colors.text_light, fontFamily: 'Gotham-Medium'}}>
                        {"LOOKS LIKE YOUR DON'T HAVE\nANY CONTACTS IN PROMISE\nPATROL YET."}
                    </Text>
                }
                {
                    state.contacts.length != 0 && 
                    <Text style={{marginTop: 25, textAlign: 'center', fontSize: 30, color: Colors.white, fontFamily: Fonts.GothamCondensedBook}}>
                        {"IMPORT CONTACTS TO BEGIN"}
                    </Text>
                }
                <TouchableOpacity onPress={() => {
                    loadPhoneContacts()
                }} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.green, borderRadius: 30, marginTop: 25}}>
                    <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'IMPORT YOUR PHONE CONTACTS'}</Text>
                </TouchableOpacity>
                <View style={{flex: 1, justifyContent: 'flex-end', paddingBottom: 25}}>
                    {/* <TouchableOpacity onPress={() => {
                        checkAuthenticationStatus()
                    }} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.facebook, borderRadius: 30}}>
                        <Image resizeMode={'contain'} source={require('../assets/images/img_facebook.png')} style={{position: 'absolute', left: 20, width: 30, height: 30, tintColor: Colors.primaryColor}} />
                        <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'INVITE FACEBOOK FRIENDS'}</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity onPress={() => {
                        checkGoogleIsSignedIn()
                    }} style={{marginTop: 10, alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.white, borderRadius: 30}}>
                        <Image resizeMode={'contain'} source={require('../assets/images/icon_google.png')} style={{position: 'absolute', left: 25, width: 30, height: 30, tintColor: Colors.primaryColor}} />
                        <Text style={{marginStart: 20, fontFamily: 'Gotham-Medium', fontSize: 14, color: '#EA4335'}}>{'INVITE GOOGLE CONCTACTS'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        navigation.push('AddContact', {})
                    }} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 60, backgroundColor: Colors.text_light, borderRadius: 30, marginTop: 10}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.text}}>{'INVITE CONTACTS VIA EMAIL'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    const UserViewModal = () => {
        return (
            <Modal visible={state.selectedContact != null} transparent={true} >
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)'}}>
                    <View style={{width: Layouts.screenWidth - 40, maxHeight: Layouts.screenHeight - 150, alignItems: 'center', paddingTop: 35, paddingBottom: 25, backgroundColor: "#5E6B85", borderRadius: 20, borderColor: "rgba(0, 0, 0, 0.1)"}}>
                        {
                            state.selectedContact.userId != global.loggedInUser.id && 
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, selectedContact: null}))
                                navigation.push('EditContact', {contact: state.selectedContact})
                            }} style={{position: 'absolute', right: 25, top: 25}}>
                                <Image source={require('../assets/images/icon_edit_active.png')} style={{width: 24, height: 24, resizeMode: 'contain', tintColor: Colors.white}} />
                            </TouchableOpacity>
                        }
						<Text style={{color: "#fff", fontSize: 18, fontFamily: 'Gotham-Medium'}}>{state.selectedContact.userId != global.loggedInUser.id ? state.selectedContact.firstName : 'MYSELF'}</Text>
						<ScrollView style={{marginVertical: 20}} contentContainerStyle={{paddingHorizontal: 20}} showsVerticalScrollIndicator={false}>
							<Text style={{color: "#fff", textAlign: "left", fontSize: 16, fontFamily: 'Avenir-Light'}}>
								{'What do you want to do?'}
							</Text>
						</ScrollView>
                        {
                            state.selectedContact.userId != global.loggedInUser.id && 
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, selectedContact: null}))
                                navigation.push('HeadToHead', {userId: state.selectedContact.userId})
                            }} style={{marginTop: 15, flexDirection: 'row', width: Layouts.screenWidth - 80, height: 60, borderRadius: 30, backgroundColor: '#3E4D66', alignItems: 'center', justifyContent: 'center'}}>
                                <Image style={{position: 'absolute', left: 15, width: 36, height: 36, resizeMode: 'contain'}} source={require('../assets/images/icon_users.png')} />
                                <Text style={{marginStart: 15, color: Colors.white, fontFamily: Fonts.GothamMedium, fontSize: 14}}>{'HEAD TO HEAD'}</Text>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, selectedContact: null}))
                            navigation.push('MakeAPromise', {contact: state.selectedContact, type: 'PROMISE'})
						}} style={{marginTop: 15, flexDirection: 'row', width: Layouts.screenWidth - 80, height: 60, borderRadius: 30, backgroundColor: '#3E4D66', alignItems: 'center', justifyContent: 'center'}}>
                            <Image style={{position: 'absolute', left: 15, width: 36, height: 36, resizeMode: 'contain'}} source={require('../assets/images/icon_new_promise.png')} />
							<Text style={{marginStart: 15, color: Colors.white, fontFamily: Fonts.GothamMedium, fontSize: 14}}>{'MAKE A PROMISE'}</Text>
						</TouchableOpacity>
                        {
                            state.selectedContact.userId != global.loggedInUser.id && 
                            <TouchableOpacity onPress={() => {
                                setState(prevState => ({...prevState, selectedContact: null}))
                                navigation.push('MakeAPromise', {contact: state.selectedContact, type: 'REQUEST'})
                            }} style={{marginTop: 15, flexDirection: 'row', width: Layouts.screenWidth - 80, height: 60, borderRadius: 30, backgroundColor: '#3E4D66', alignItems: 'center', justifyContent: 'center'}}>
                                <Image style={{position: 'absolute', left: 15, width: 36, height: 36, resizeMode: 'contain'}} source={require('../assets/images/icon_new_promise_flip.png')} />
                                <Text style={{marginStart: 15, color: Colors.white, fontFamily: Fonts.GothamMedium, fontSize: 14}}>{'PROMISE MADE TO ME'}</Text>
                            </TouchableOpacity>
                        }
						<View style={{height: 1, marginTop: 25, backgroundColor: "#3B4A64", width: Layouts.screenWidth - 40}} />
						<TouchableOpacity onPress={() => {
                            setState(prevState => ({...prevState, selectedContact: null}))
						}} style={{marginTop: 15, width: Layouts.screenWidth - 80, height: 60, borderRadius: 30, borderWidth: 2, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center'}}>
							<Text style={{color: Colors.white, fontFamily: Fonts.GothamMedium, fontSize: 14}}>{'CANCEL'}</Text>
						</TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
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
                                        setState(prevState => ({...prevState, isVisibleContactsModal: false}))
                                        setTimeout(() => {
                                            navigation.push('AddContact', {firstName: item.givenName, lastName: item.familyName, email: item.email})
                                        }, 0);                                        
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
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={'Loading...'}/>
            { state.selectedContact != null && UserViewModal() }
            { state.isVisibleContactsModal && ContactsModal() }
            { state.contacts.length == 0 && state.isDataLoaded && EmptyView() }
            {
                state.contacts.length != 0 && 
                <FlatList
                    data={state.contacts}
                    renderItem={({item, index}) => ContactUserItem(item, index)}
                    refreshing={state.refreshing}
                    onRefresh={() => loadContacts()}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={RecentView()}
                    ItemSeparatorComponent={() => (
                        <View style={{height: 15}} />
                    )}
                    style={{marginTop: 5, width: Layouts.screenWidth}}
                    contentContainerStyle={{paddingBottom: 15}}
                />
            }
            {
                state.contacts.length != 0 && 
                <TouchableOpacity onPress={() => {
                    navigation.push('AddContact', {})
                }} style={{alignItems: 'center', justifyContent: 'center', width: Layouts.screenWidth - 40, height: 50, backgroundColor: Colors.text, borderRadius: 30, marginTop: 10, marginBottom: 20}}>
                    <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'ADD NEW CONTACT'}</Text>
                </TouchableOpacity>
            }
        </View>
    )
}

export default PeopleScreen;