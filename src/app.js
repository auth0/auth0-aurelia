import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {tokenIsExpired} from './utils/tokenUtils';

@inject(HttpClient, Router)
export class App {
  message = 'Auth0 - Aurelia';
  lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN);
  isAuthenticated = false;
  
  constructor(http, router) {
    this.http = http;
    this.router = router;
    
    this.router.configure(config => {
      config.map([
        {
          route: 'public-route',
          name: 'public',
          moduleId: './public-route'
        },
        {
          route: 'private-route',
          name: 'private',
          moduleId: './private-route'
        }
      ])
    });
    this.http.configure(config => {
      config.withDefaults({
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('id_token')}`
        }
      });
    });
    
    if(tokenIsExpired())  {
      this.isAuthenticated = false;
    }
    else {
      this.isAuthenticated = true;
    }
  }
  
  login() {
    this.lock.show((err, profile, token) => {
      if(err) {
        console.log(err);
      }
      else {
        localStorage.setItem('profile', JSON.stringify(profile));
        localStorage.setItem('id_token', token);
        this.isAuthenticated = true;
      }
    });   
  }
  
  logout() {
    localStorage.removeItem('profile');
    localStorage.removeItem('id_token');
    this.isAuthenticated = false;   
  }
  
  getSecretThing() {
    this.http.fetch('/api/protected-route', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('id_token')}`
      }
    })
    .then(response => response.json())
    .then(data => this.secretThing = data.text);
  }
  
  getDecodedJwt() {
    let jwt = localStorage.getItem('id_token');
    if(jwt) {
      this.decodedJwt = JSON.stringify(jwt_decode(jwt), null, 2);
    }
    else {
      this.decodedJwt = "No JWT Saved";
    }
  }
 
}
