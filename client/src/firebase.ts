import { Platform } from 'react-native';

let firebaseModule;
if (Platform.OS === 'web') {
  firebaseModule = require('./firebase.web');
} else {
  firebaseModule = require('./firebase.native');
}

export const auth = firebaseModule.auth;
export const googleProvider = firebaseModule.googleProvider;
export const signInWithPopup = firebaseModule.signInWithPopup; 