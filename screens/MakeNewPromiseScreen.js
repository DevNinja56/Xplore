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
    SafeAreaView,
} from 'react-native';
import Colors from '../constants/Colors';
import Layouts from '../constants/Layouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Functions from '../constants/Functions';
import axios from 'axios';
import Fonts from '../constants/Fonts';
import DisplayLoadingSpinner from '../constants/DisplayLoadingSpinner';

function MakeNewPromiseScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [state, setState] = useState({
        loading: false,
        loadingMessage: '',
        refreshing: false,
        keyword: '',
        contacts: [],
        recentContacts: [],
        seletedContact: undefined,
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
                    {route.params.type == 'PROMISE' ? 'ADD PROMISE MADE BY ME' : 'ADD PROMISE MADE TO ME'}
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
    const ContactUserItem = (contact, index) => {        
        return (
            <TouchableOpacity key={index.toString()} onPress={() => {
                navigation.push('MakeAPromise', {contact: contact, type: route.params.type, description: route.params.description, category: route.params.category})
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
                navigation.push('MakeAPromise', {contact: contact, type: route.params.type, description: route.params.description, category: route.params.category})
            }} style={{alignItems: 'center', marginStart: index == 0 ? 5 : 15}}>
                <View>
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
            <View style={{alignItems: 'center', width: Layouts.screenWidth}}>
                <View style={{flexDirection: 'row', width: Layouts.screenWidth - 80, justifyContent: 'space-between', paddingTop: 10, paddingBottom: 20}}>
                    <View style={{alignItems: 'center'}}>
                        <View style={{width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary_dark, justifyContent: 'center', alignItems: 'center'}}>
                            {
                                route.params.type == 'PROMISE' ?
                                <Image source={{uri: global.uploadURL + global.loggedInUser.photo}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} /> : 
                                state.seletedContact == undefined ? 
                                <Text style={{fontSize: 30, fontFamily: 'GothamCondensed-Medium', color: Colors.white}}>{'?'}</Text>
                                : 
                                <Image source={{uri: global.uploadURL + state.seletedContact.photo}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                            }
                        </View>
                        <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_light}}>
                            {
                                route.params.type == 'PROMISE' ? 
                                'I' :
                                state.seletedContact == undefined ? '?' : state.seletedContact.firstName.toUpperCase()
                            }
                        </Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <View style={{height: 60, justifyContent: 'center'}}>
                            <Image source={require('../assets/images/icon_promise_transparent.png')} style={{resizeMode: 'contain', width: 80, height: 40}} />
                        </View>
                        <Text style={{letterSpacing: 1, marginTop: 3, fontSize: 18, fontFamily: 'Gotham-Medium', color: Colors.gray_lighter}}>{route.params.type == 'PROMISE' ? 'PROMISE' : 'PROMISED'}</Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <View style={{width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary_dark, justifyContent: 'center', alignItems: 'center'}}>
                            {
                                route.params.type == 'REQUEST' ?
                                <Image source={{uri: global.uploadURL + global.loggedInUser.photo}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} /> : 
                                state.seletedContact == undefined ? 
                                <Text style={{fontSize: 30, fontFamily: 'GothamCondensed-Medium', color: Colors.white}}>{'?'}</Text>
                                : 
                                <Image source={{uri: global.uploadURL + state.seletedContact.photo}} style={{backgroundColor: Colors.gray_lighter, width: 60, height: 60, borderRadius: 30}} />
                            }
                        </View>
                        <Text style={{marginTop: 5, fontSize: 16, fontFamily: 'GothamCondensed-Book', color: Colors.text_light}}>
                            {
                                route.params.type == 'REQUEST' ? 
                                'ME' :
                                state.seletedContact == undefined ? '?' : state.seletedContact.firstName.toUpperCase()
                            }
                        </Text>
                    </View>
                </View>                
                <View style={{width: Layouts.screenWidth - 30, marginHorizontal: 15, borderTopWidth: 1, borderTopColor: Colors.text_light}}>
                {
                    state.recentContacts.length > 0 && 
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingVertical: 15}}>
                            {
                                state.recentContacts.map((contact, index) => 
                                    RecentUserItem(contact, index)
                                )
                            }
                        </ScrollView>
                }
                </View>
                {
                    state.contacts.length > 0 && 
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
                            marginTop: state.recentContacts.length == 0 ? 15 : 0,
                            marginBottom: 15,
                        }}                        
                        onSubmitEditing={() => Keyboard.dismiss()}
                        onChangeText={(val) => setState(prevState => ({...prevState, keyword: val.toLowerCase()}))}
                    />
                }
            </View>
        )
    }
    function loadContacts() {
        setState(prevState => ({...prevState, loading: true, loadingMessage: 'Loading...', refreshing: false}))
        axios.get('apis/load_contacts', {
            params: {
                userId: global.loggedInUser.id,
            }
        })
        .then(function (response) {
            if (response.data.users.length == 0) {
                setState(prevState => ({...prevState, loading: false, refreshing: false, isVisibleAddView: true, contacts: [], recentContacts: []}))
            } else {
                if (route.params.type == 'PROMISE') {
                    const sortedContacts = response.data.users.sort(function(a, b) { return a.userId == global.loggedInUser.id ? -1 : b.userId == global.loggedInUser.id ? 1 : 0; });
                    const sortedRecentContacts = response.data.users.sort(function(a, b) { return a.userId == global.loggedInUser.id ? -1 : b.userId == global.loggedInUser.id ? 1 : 0; });

                    setState(prevState => ({...prevState, loading: false, refreshing: false, contacts: sortedContacts, recentContacts: sortedRecentContacts}))
                } else {
                    setState(prevState => ({...prevState, 
                        loading: false, 
                        refreshing: false, 
                        contacts: response.data.users.filter((user) => {
                            return user.userId != global.loggedInUser.id
                        }), 
                        recentContacts: response.data.users.filter((user) => {
                            return user.userId != global.loggedInUser.id
                        })}))
                }
            }            
        })
        .catch(function (error) {
            setState(prevState => ({...prevState, loading: false, refreshing: false}))
            setTimeout(() => {
                Functions.shared().showErrorMessage("Network Error", (error.response == undefined || error.response.data == undefined) ? 'Some problems occurred. please try again.' : error.response.data, "Try again")
            }, 100)
        });
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background}}>
            <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'light-content'} backgroundColor={Colors.black} />
            <DisplayLoadingSpinner visible={state.loading} message={state.loadingMessage}/>
            <SafeAreaView style={{alignItems: 'center'}}>
                <FlatList
                    data={state.contacts}
                    renderItem={({item, index}) => ContactUserItem(item, index)}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={RecentView()}
                    ItemSeparatorComponent={() => (
                        <View style={{height: 15}} />
                    )}
                    ListEmptyComponent={() => 
                        <View style={{alignSelf: 'center', paddingTop: 25}}>
                            <Text style={{fontFamily: Fonts.GothamMedium, textAlign: 'center', lineHeight: 22, fontSize: 16, color: Colors.white}}>{"WE CAN'T FIND ANY PERSON.\nWANT TO ADD THEM?"}</Text>
                        </View>
                    }
                    style={{marginTop: 5}}
                />
                <View style={{paddingVertical: 20}}>
                    <TouchableOpacity onPress={() => {
                        navigation.push('AddContact', {})
                    }} style={{height: 60, width: Layouts.screenWidth - 40, borderRadius: 30, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontFamily: 'Gotham-Medium', fontSize: 14, color: Colors.white}}>{'ADD A NEW CONTACT'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default MakeNewPromiseScreen;