import React, { useEffect, useReducer, useState, useRef, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  LogBox,
  TextInput,
  Linking,
} from 'react-native';
import { getFocusedRouteNameFromRoute, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import * as firebase from 'firebase'
import axios from 'axios'
import moment from 'moment'
import 'moment-timezone';

import OneSignal from 'react-native-onesignal'
import * as Sentry from "@sentry/react-native";
import AuthContext from './Auth'
import Colors from './constants/Colors';
import Layouts from './constants/Layouts';
import SplashScreen from './screens/auth/SplashScreen'
import AuthScreen from './screens/AuthScreen';
import MadeByMeScreen from './screens/MadeByMeScreen';
import SignInScreen from './screens/auth/SignInScreen';
import StartScreen from './screens/auth/StartScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import CreateAccountScreen from './screens/auth/CreateAccountScreen';
import MadeToMeScreen from './screens/MadeToMeScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PeopleScreen from './screens/PeopleScreen';
import AccountScreen from './screens/AccountScreen';
import AddContactScreen from './screens/AddContactScreen';
import MakeNewPromiseScreen from './screens/MakeNewPromiseScreen';
import MakeAPromiseScreen from './screens/MakeAPromiseScreen';
import EditContactScreen from './screens/EditContactScreen';
import HeadToHeadScreen from './screens/HeadToHeadScreen';
import EditAccountScreen from './screens/EditAccountScreen';
import Constants from './constants/Constants';
import Functions from './constants/Functions';
import EditEmailScreen from './screens/EditEmailScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import EditPromiseScreen from './screens/EditPromiseScreen';
import PromisesScreen from './screens/PromisesScreen';
import PromiseNotificationsScreen from './screens/PromiseNotificationsScreen';
import ChatScreen from './screens/ChatScreen';
import ConfirmBrokenPromiseScreen from './screens/ConfirmBrokenPromiseScreen';
import * as RNLocalize from "react-native-localize";

if(Text.defaultProps == null) Text.defaultProps = {}
Text.defaultProps.allowFontScaling = false;

if(TextInput.defaultProps == null) TextInput.defaultProps = {}
TextInput.defaultProps.allowFontScaling = false;

LogBox.ignoreLogs(['Warning: AsyncStorage has been extracted from react-native core and will be removed in a future release.']); // Ignore log notification by message
LogBox.ignoreAllLogs();

moment.updateLocale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ago",
        s  : 'a few seconds',
        ss : '%d seconds',
        m:  "a minute",
        mm: "%d mins",
        h:  "an hour",
        hh: "%d hrs",
        d:  "a day",
        dd: "%d days",
        w:  "a week",
        ww: "%d weeks",
        M:  "a month",
        MM: "%d months",
        y:  "a year",
        yy: "%d yrs"
    }
});

const liveMode = true
global.serverURL = liveMode ? 'http://ec2-54-177-211-41.us-west-1.compute.amazonaws.com' : Platform.OS == 'ios' ? "http://localhost" : "http://10.0.3.2"
global.uploadURL = global.serverURL + '/pinkypromise/uploads/'
global.pushToken = ""

axios.defaults.baseURL = global.serverURL + '/pinkypromise/index.php/api/';
axios.defaults.timeout = 100000;
axios.defaults.headers = {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
    "X-API-KEY": "CLOUDTENLABS_WANG",
    "Authorization": "Basic " +  Functions.shared().Base64.btoa('mobile_user:choreobook')
};

const deviceTimeZone = RNLocalize.getTimeZone();
const today = moment().tz(deviceTimeZone);
const currentTimeZoneOffsetInHours = today.utcOffset() / 60;
global.timezoneOffset = currentTimeZoneOffsetInHours

if (!firebase.apps.length) {
    firebase.initializeApp(Constants.firebaseConfig);
}

const SplashStack = createStackNavigator();
const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const MadeByMeStack = createStackNavigator();
const MadeToMeStack = createStackNavigator();
const NotificationsStack = createStackNavigator();
const PeopleStack = createStackNavigator();
const AccountStack = createStackNavigator();

function TabMadeByMe({navigation, route}) {
    useLayoutEffect(() => {

    }, [navigation, route])
    return (
        <MadeByMeStack.Navigator initialRouteName={'MadeByMe'} headerMode={'screen'}>
            <MadeByMeStack.Screen 
                name="MadeByMe"
                component={ MadeByMeScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeByMeStack.Screen 
                name="MakeNewPromise"
                component={ MakeNewPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeByMeStack.Screen 
                name="EditPromise"
                component={ EditPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
            {/* <MadeByMeStack.Screen 
                name="Promise"
                component={ PromiseScreen }
                options={({ navigation, route }) => ({
                })} /> */}
            <MadeByMeStack.Screen 
                name="Promises"
                component={ PromisesScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeByMeStack.Screen 
                name="MakeAPromise"
                component={ MakeAPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeByMeStack.Screen 
                name="AddContact"
                component={ AddContactScreen }       
                options={({ navigation, route }) => ({
                })} />
            <MadeByMeStack.Screen 
                name="HeadToHead"
                component={ HeadToHeadScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeByMeStack.Screen 
                name="PromiseNotifications"
                component={ PromiseNotificationsScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeByMeStack.Screen 
                name="Chat"
                component={ ChatScreen }
                options={({ navigation, route }) => ({
                    headerShown: false
                })} />
            <MadeByMeStack.Screen 
                name="ConfirmBrokenPromise"
                component={ ConfirmBrokenPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
        </MadeByMeStack.Navigator>
    )
}

function TabMadeToMe({navigation, route}) {
    useLayoutEffect(() => {

    }, [navigation, route])
    return (
        <MadeToMeStack.Navigator initialRouteName={'MadeToMe'} headerMode={'screen'}>
            <MadeToMeStack.Screen 
                name="MadeToMe"
                component={ MadeToMeScreen }       
                options={({ navigation, route }) => ({
                })} />
            <MadeToMeStack.Screen 
                name="MakeNewPromise"
                component={ MakeNewPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeToMeStack.Screen 
                name="EditPromise"
                component={ EditPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
            {/* <MadeToMeStack.Screen 
                name="Promise"
                component={ PromiseScreen }
                options={({ navigation, route }) => ({
                })} /> */}
            <MadeToMeStack.Screen 
                name="Promises"
                component={ PromisesScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeToMeStack.Screen 
                name="MakeAPromise"
                component={ MakeAPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeToMeStack.Screen 
                name="AddContact"
                component={ AddContactScreen }       
                options={({ navigation, route }) => ({
                })} />
            <MadeToMeStack.Screen 
                name="HeadToHead"
                component={ HeadToHeadScreen }       
                options={({ navigation, route }) => ({
                })} />
            <MadeToMeStack.Screen 
                name="PromiseNotifications"
                component={ PromiseNotificationsScreen }
                options={({ navigation, route }) => ({
                })} />
            <MadeToMeStack.Screen 
                name="Chat"
                component={ ChatScreen }
                options={({ navigation, route }) => ({
                    headerShown: false
                })} />
            <MadeToMeStack.Screen 
                name="ConfirmBrokenPromise"
                component={ ConfirmBrokenPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
        </MadeToMeStack.Navigator>
    )
}

function TabNotification({navigation, route}) {
    useLayoutEffect(() => {

    }, [navigation, route])
    return (
        <NotificationsStack.Navigator initialRouteName={'Notifications'} headerMode={'screen'}>
            <NotificationsStack.Screen 
                name="Notifications"
                component={ NotificationsScreen }       
                options={({ navigation, route }) => ({
                })} />
            <NotificationsStack.Screen 
                name="HeadToHead"
                component={ HeadToHeadScreen }       
                options={({ navigation, route }) => ({
                })} />
            <NotificationsStack.Screen 
                name="Promises"
                component={ PromisesScreen }
                options={({ navigation, route }) => ({
                })} />
            <NotificationsStack.Screen 
                name="PromiseNotifications"
                component={ PromiseNotificationsScreen }
                options={({ navigation, route }) => ({
                })} />
            <NotificationsStack.Screen 
                name="Chat"
                component={ ChatScreen }
                options={({ navigation, route }) => ({
                    headerShown: false
                })} />
            {/* <NotificationsStack.Screen 
                name="Promise"
                component={ PromiseScreen }
                options={({ navigation, route }) => ({
                })} /> */}
            <NotificationsStack.Screen 
                name="ConfirmBrokenPromise"
                component={ ConfirmBrokenPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
            <NotificationsStack.Screen 
                name="MakeAPromise"
                component={ MakeAPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
        </NotificationsStack.Navigator>
    )
}

function TabPeople({navigation, route}) {
    useLayoutEffect(() => {

    }, [navigation, route])
    return (
        <PeopleStack.Navigator initialRouteName={'People'} headerMode={'screen'}>
            <PeopleStack.Screen 
                name="People"
                component={ PeopleScreen }       
                options={({ navigation, route }) => ({
                })} />
            <PeopleStack.Screen 
                name="AddContact"
                component={ AddContactScreen }       
                options={({ navigation, route }) => ({
                })} />
            <PeopleStack.Screen 
                name="EditContact"
                component={ EditContactScreen }       
                options={({ navigation, route }) => ({
                })} />
            <PeopleStack.Screen 
                name="HeadToHead"
                component={ HeadToHeadScreen }       
                options={({ navigation, route }) => ({
                })} />
            <PeopleStack.Screen 
                name="Promises"
                component={ PromisesScreen }       
                options={({ navigation, route }) => ({
                })} />
            <PeopleStack.Screen 
                name="MakeAPromise"
                component={ MakeAPromiseScreen }       
                options={({ navigation, route }) => ({
                })} />
            <PeopleStack.Screen 
                name="PromiseNotifications"
                component={ PromiseNotificationsScreen }
                options={({ navigation, route }) => ({
                })} />
            <PeopleStack.Screen 
                name="Chat"
                component={ ChatScreen }
                options={({ navigation, route }) => ({
                    headerShown: false
                })} />
            {/* <PeopleStack.Screen 
                name="Promise"
                component={ PromiseScreen }
                options={({ navigation, route }) => ({
                })} /> */}
            <PeopleStack.Screen 
                name="ConfirmBrokenPromise"
                component={ ConfirmBrokenPromiseScreen }
                options={({ navigation, route }) => ({
                })} />              
        </PeopleStack.Navigator>
    )
}

function TabAccount({navigation, route}) {
    useLayoutEffect(() => {

    }, [navigation, route])
    return (
        <AccountStack.Navigator initialRouteName={'Account'} headerMode={'screen'}>
            <AccountStack.Screen 
                name="Account"
                component={ AccountScreen }       
                options={({ navigation, route }) => ({
                })} />
            <AccountStack.Screen 
                name="EditAccount"
                component={ EditAccountScreen }       
                options={({ navigation, route }) => ({
                })} />
            <AccountStack.Screen 
                name="EditEmail"
                component={ EditEmailScreen }       
                options={({ navigation, route }) => ({
                })} />
            <AccountStack.Screen 
                name="ChangePassword"
                component={ ChangePasswordScreen }       
                options={({ navigation, route }) => ({
                })} />
            <AccountStack.Screen 
                name="Promises"
                component={ PromisesScreen }       
                options={({ navigation, route }) => ({
                })} />
            <AccountStack.Screen 
                name="HeadToHead"
                component={ HeadToHeadScreen }       
                options={({ navigation, route }) => ({
                })} />
            <AccountStack.Screen 
                name="PromiseNotifications"
                component={ PromiseNotificationsScreen }
                options={({ navigation, route }) => ({
                })} />
            <AccountStack.Screen 
                name="Chat"
                component={ ChatScreen } 
                options={({ navigation, route }) => ({
                    headerShown: false
                })}/>
            {/* <AccountStack.Screen 
                name="Promise"
                component={ PromiseScreen }
                options={({ navigation, route }) => ({
                })} /> */}
            <AccountStack.Screen 
                name="ConfirmBrokenPromise"
                component={ ConfirmBrokenPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
            <AccountStack.Screen 
                name="MakeAPromise"
                component={ MakeAPromiseScreen }
                options={({ navigation, route }) => ({
                })} />
        </AccountStack.Navigator>
    )
}

function TabNavigator({navigation, route}) {
    const insets = useSafeAreaInsets();
    const screensWithTab = ["MadeByMe", "MadeToMe", "Notifications", "People", "Account"]
    const [messageCount, setMessageCount] = useState(0)
    return (
        <MainTab.Navigator 
            screenOptions={({ navigation, route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName, tabName;
                    if (route.name === 'TabMadeByMe') {
                        iconName = !focused 
                            ? require('./assets/images/tab_madebyme_normal.png') : require('./assets/images/tab_madebyme_selected.png')
                        tabName = "Made by me"
                    } else if (route.name === 'TabMadeToMe') {
                        iconName = !focused 
                            ? require('./assets/images/tab_madetome_normal.png') : require('./assets/images/tab_madetome_selected.png')
                        tabName = "Made to me"
                    } else if (route.name === 'TabNotification') {
                        iconName = !focused 
                            ? require('./assets/images/tab_notification_normal.png') : require('./assets/images/tab_notification_selected.png')
                        tabName = "Notifications"
                    } else if (route.name === 'TabPeople') {
                        iconName = !focused 
                            ? require('./assets/images/tab_people_normal.png') : require('./assets/images/tab_people_selected.png')
                        tabName = "People"
                    } else if (route.name === 'TabAccount') {
                        iconName = !focused 
                            ? require('./assets/images/tab_account_normal.png') : require('./assets/images/tab_account_selected.png')
                        tabName = "My Account"
                    }
                    return (
                        <View style={{alignItems: 'center'}}>
                            <Image style={{resizeMode: 'contain', width: route.name === 'TabNotification' ? 24 : 32, height: 32, tintColor: focused ? Colors.secondaryColor : Colors.lighgrayColor}} source={iconName}/>
                            <Text style={{marginTop: 2, color: 'white', fontFamily: 'Avenir-Light', fontSize: 11}}>{tabName}</Text>
                            {/* {
                                route.name == 'TabMessage' && messageCount != 0 && 
                                <View style={{position: 'absolute', right: -10, backgroundColor: 'red', minWidth: 20, borderRadius: 10, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                                    <Text style={{color: 'white'}}>{messageCount}</Text>
                                </View>
                            } */}
                        </View>
                    )
                },
                tabBarLabel: ({ focused, color, size }) => {
                    return null
                },
            })}
            tabBarOptions={{
                // activeTintColor: 'rgba(70,83,111,1)',
                // inactiveTintColor: Colors.whiteColor,
                keyboardHidesTabBar: false,
                style: {
                    width: Layouts.screenWidth,
                    height: 60 + insets.bottom,
                    backgroundColor: 'rgba(70,83,111,1)',
                    borderTopWidth: 0,
                },
                tabStyle: {
                    paddingTop: 0,
                    paddingBottom: 0,
                    borderTopColor: 'rgba(219,219,219,0.5)',
                    borderTopWidth: 0,
                },
            }}
            >
            <MainTab.Screen 
                name="TabMadeByMe" 
                component={ TabMadeByMe } 
                options={({route}) => ({tabBarVisible: (getFocusedRouteNameFromRoute(route) == undefined || screensWithTab.includes(getFocusedRouteNameFromRoute(route))) ? true : false,})} 
            />
            <MainTab.Screen 
                name="TabMadeToMe" 
                component={ TabMadeToMe } 
                options={({route}) => ({tabBarVisible: (getFocusedRouteNameFromRoute(route) == undefined || screensWithTab.includes(getFocusedRouteNameFromRoute(route))) ? true : false, })} 
                />
            <MainTab.Screen 
                name="TabNotification" 
                component={ TabNotification } 
                options={({route}) => ({tabBarVisible: (getFocusedRouteNameFromRoute(route) == undefined || screensWithTab.includes(getFocusedRouteNameFromRoute(route))) ? true : false, })} 
                />
            <MainTab.Screen 
                name="TabPeople" 
                component={ TabPeople } 
                options={({route}) => ({tabBarVisible: (getFocusedRouteNameFromRoute(route) == undefined || screensWithTab.includes(getFocusedRouteNameFromRoute(route))) ? true : false, })} 
                />
            <MainTab.Screen 
                name="TabAccount" 
                component={ TabAccount } 
                options={({route}) => ({tabBarVisible: (getFocusedRouteNameFromRoute(route) == undefined || screensWithTab.includes(getFocusedRouteNameFromRoute(route))) ? true : false, })} 
                />
        </MainTab.Navigator>
    )
}

function App({ navigation }) { 
    const [state, dispatch] = useReducer(
        (prevState, action) => {
            switch (action.type) {
                case 'RESTORE_TOKEN':
                    return {
                        ...prevState,
                        token: action.token,
                        loading: false,
                    };
                case 'SIGN_IN':
                    return {
                        ...prevState,
                        token: action.token,
                    };
                case 'SIGN_OUT':
                    return {
                        ...prevState,
                        token: null,
                    };
            }
        },
        {
            loading: true,
            token: null,
        }
    );
    const authContext = React.useMemo(
        () => ({
            signIn: async data => {
                dispatch({type: 'SIGN_IN', token: 'dummy-token'});
            },
            signOut: () => {
                dispatch({type: 'SIGN_OUT'})
            },
            signUp: async data => {
                dispatch({type: 'SIGN_IN', token: 'dummy-token'})
            },
        }),
        []
    );
    async function setupOneSignal() {
        OneSignal.setLogLevel(6, 0);
        OneSignal.setAppId("86f818b5-dfaf-4fca-aa54-5764b912b492");
              
        OneSignal.promptForPushNotificationsWithUserResponse(response => {
            // console.log("Prompt response:", response);
        });
        OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
            // console.log("OneSignal: notification will show in foreground:", notificationReceivedEvent);
            // let notification = notificationReceivedEvent.getNotification();
            // console.log("notification: ", notification);
            // const data = notification.additionalData
            // console.log("additionalData: ", data);
            // const button1 = {
            //     text: "Cancel",
            //     onPress: () => { notificationReceivedEvent.complete(); },
            //     style: "cancel"
            // };
            // const button2 = { text: "Complete", onPress: () => { notificationReceivedEvent.complete(notification); }};
            // Alert.alert("Complete notification?", "Test", [ button1, button2], { cancelable: true });
        });
        OneSignal.setNotificationOpenedHandler(notification => {
            // console.log("OneSignal: notification opened:", notification);
            Linking.openURL("pinkypromise://notifications")
        });
        const deviceState = await OneSignal.getDeviceState();
        global.pushToken = deviceState.userId
    }
    useEffect(() => {
        setTimeout(() => {
            dispatch({type: 'RESTORE_TOKEN', token: null})            
        }, 100)
        setupOneSignal()
        return () => {
            OneSignal.clearHandlers()
        };
    }, []);
    const linking = {
        prefixes: [
            'https://pinkypromise.rocks', 'pinkypromise://'
        ],
        config: {
            screens: {
                TabNotification: {
                    screens: {
                        Notifications: 'notifications'
                    }
                }
            }
        }
    }
    return (
        <AuthContext.Provider value={authContext}>
            <SafeAreaProvider>
                <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
                    <StatusBar barStyle="dark-content" backgroundColor={'white'}/>
                    {
                        state.loading ? (
                            <SplashStack.Navigator initialRouteName={'Splash'}>
                                <SplashStack.Screen name="Splash" component={ SplashScreen } options={{headerShown: false}}/>
                            </SplashStack.Navigator>
                        ) :  state.token != null ? 
                            <TabNavigator />
                        : 
                        <AuthStack.Navigator initialRouteName={'Auth'}>
                            <AuthStack.Screen name="Auth" component={ AuthScreen } options={({ navigation, route }) => ({headerShown: false, animationEnabled: false})} />
                            <AuthStack.Screen name="Start" component={ StartScreen } options={({ navigation, route }) => ({headerShown: false, animationEnabled: false})} />
                            <AuthStack.Screen name="SignIn" component={ SignInScreen } options={({ navigation, route }) => ({headerShown: true, animationEnabled: true})} />
                            <AuthStack.Screen name="ForgotPassword" component={ ForgotPasswordScreen } options={({ navigation, route }) => ({headerShown: true, animationEnabled: true})} />
                            <AuthStack.Screen name="CreateAccount" component={ CreateAccountScreen } options={({ navigation, route }) => ({headerShown: true, animationEnabled: true})} />
                        </AuthStack.Navigator>
                    }
                </NavigationContainer>
            </SafeAreaProvider>
        </AuthContext.Provider>
    );
}

export default App;