import history from '../history';
import {Auth0Lock} from "auth0-lock"
import { AUTH_CONFIG } from './auth0-variables';

export default class Auth {

  auth0Lock = new Auth0Lock(AUTH_CONFIG.clientId, AUTH_CONFIG.domain,{
    auth: {
      redirectUrl: AUTH_CONFIG.baseUrl + AUTH_CONFIG.redirectRoute,
      responseType: 'token id_token',
      params: {scope: 'openid email profile'}
    },
    theme: {
      logo: 'https://s3-eu-west-1.amazonaws.com/krys/trinetx-public/trinetx.png',
      primaryColor: '#258ae2'
    },
    languageDictionary: {
      title: "TriNetX Federated Login",
      emailInputPlaceholder: "Your organization email address",
      passwordInputPlaceholder: "",
      invalidErrorHint: "",
    },
    allowSignUp: false,
    closable: true
  });

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.setSession = this.setSession.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.auth0Lock.on('authenticated', (authResult) => this.handleAuthentication(authResult));
  }

  handleAuthentication(authResult) {
    if (authResult && authResult.accessToken) {

      // Hide the lock
      this.auth0Lock.hide();

      this.auth0Lock.getUserInfo(authResult.accessToken, (error, profile) => {
        if (error) {
          console.log("Problem getting user profile: ", JSON.stringify(error));
        } else {
          alert("Profile: " + JSON.stringify(profile))

          // navigate to the home route after we have everything
          this.setSession(authResult);
          history.replace('/home');
        }
      });
    }
  }

  login() {
      this.auth0Lock.show();
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('id_token_payload', JSON.stringify(authResult.idTokenPayload));
    localStorage.setItem('expires_at', expiresAt);
  }

  logout() {

    // Clear access token and ID token from local storage
    localStorage.clear()

    this.auth0Lock.logout({
      returnTo: AUTH_CONFIG.baseUrl + AUTH_CONFIG.logoutRoute
    });
  }

  isAuthenticated() {
    // Check whether the current time is past the 
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }
}
