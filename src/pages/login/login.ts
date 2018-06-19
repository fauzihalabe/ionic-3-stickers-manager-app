import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, ModalController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook'
//Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { TabsPage } from '../tabs/tabs';
import { FCM } from '@ionic-native/fcm';
import { ContaPage } from '../conta/conta';

 
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  array = [];
  tabsPage = TabsPage;
  userData: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public fb: Facebook,
    private afAuth: AngularFireAuth,
    public platform: Platform,
    private afDB: AngularFireDatabase,
    private storage: Storage,
    private http: HttpClient,
    public loadingCtrl: LoadingController,
    private fcm: FCM,
    public modalCtrl: ModalController
  ) {
  }

  facebookLogin() {
    if (this.platform.is('cordova')) {
      console.log("Cordova");
      this.fb.login(["public_profile" ,"email"]).then(res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        firebase.auth().signInWithCredential(facebookCredential)
        .then((res) => {
          console.log(res);
          this.salvarDados(res);
        })
        .catch((err) => {
          console.log(JSON.stringify(err))
        })
      })
    }
    else {
      this.afAuth.auth
        .signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then((res) => {
          console.log(res);
          this.salvarDados(res);

        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  salvarDados(res){
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    //Pegar figurinhas que já tem
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    //Request usuario
    let url2 = 'https://app-album.firebaseio.com/Usuarios/' + res.uid + '.json';
    this.http.get(url2, { headers: headers }).subscribe(data => {
      if(data){
        if(JSON.parse(JSON.stringify(data)).total){
          this.storage.set('logadoAlbum', 'sim');
          this.storage.set('uid', res.uid);
          //FCM
          this.fcm.getToken().then(token => {
            this.afDB.object('Tokens/' + res.uid + '/' + token).set({
                token: token
            });
          })

          this.afDB.object('Usuarios/' + res.uid).update({
            foto: res.providerData[0].photoURL,
            nome: res.displayName,
          })
          .then(() => {
            loader.dismiss();
            this.navCtrl.setRoot(this.tabsPage);
          })
        }
        else {
          this.storage.set('logadoAlbum', 'sim');
          this.storage.set('uid', res.uid);
          this.fcm.getToken().then(token => {
            this.afDB.object('Tokens/' + res.uid + '/' + token).set({
                token: token
            });
          })

          this.afDB.object('Usuarios/' + res.uid).update({
            foto: res.providerData[0].photoURL,
            nome: res.displayName,
            total: 0
          })
          .then(() => {
            loader.dismiss();
            this.navCtrl.setRoot(this.tabsPage);
          })
        }
      }
      else {
        this.storage.set('logadoAlbum', 'sim');
        this.storage.set('uid', res.uid);
        this.fcm.getToken().then(token => {
          this.afDB.object('Tokens/' + res.uid + '/' + token).set({
            fcmToken: token
          });
        })
        this.afDB.object('Usuarios/' + res.uid).update({
          foto: res.providerData[0].photoURL,
          nome: res.displayName,
          total: 0
        })
        .then(() => {
          loader.dismiss();
          this.navCtrl.setRoot(this.tabsPage);
        })
      }
    });

  }

  criarConta(){
    let modal = this.modalCtrl.create(ContaPage);
    modal.present();

    modal.onDidDismiss(data => {
      if(data.criou === 'sim'){
        this.salvar(data);
      }
      else if(data.login === 'sim'){
        this.salvarLogin(data);
      }
    });
  }

  salvar(res){
    console.log(res);
    
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    //Pegar figurinhas que já tem
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    //Request usuario
    let url2 = 'https://app-album.firebaseio.com/Usuarios/' + res.uid + '.json';
    this.http.get(url2, { headers: headers }).subscribe(data => {
      if(data){
        if(JSON.parse(JSON.stringify(data)).total){
          this.storage.set('logadoAlbum', 'sim');
          this.storage.set('uid', res.uid);
          //FCM
          this.fcm.getToken().then(token => {
            this.afDB.object('Tokens/' + res.uid + '/' + token).set({
                token: token
            });
          })

          this.afDB.object('Usuarios/' + res.uid).update({
            foto: 'https://firebasestorage.googleapis.com/v0/b/app-album.appspot.com/o/default-user-icon.png?alt=media&token=a9e8d537-eafa-45d5-b0d0-c979a6c172f1',
            nome: res.name,
          })
          .then(() => {
            loader.dismiss();
            this.navCtrl.setRoot(this.tabsPage);
          })
        }
        else {
          this.storage.set('logadoAlbum', 'sim');
          this.storage.set('uid', res.uid);
          this.fcm.getToken().then(token => {
            this.afDB.object('Tokens/' + res.uid + '/' + token).set({
                token: token
            });
          })

          this.afDB.object('Usuarios/' + res.uid).update({
            foto: 'https://firebasestorage.googleapis.com/v0/b/app-album.appspot.com/o/default-user-icon.png?alt=media&token=a9e8d537-eafa-45d5-b0d0-c979a6c172f1',
            nome: res.name,
            total: 0
          })
          .then(() => {
            loader.dismiss();
            this.navCtrl.setRoot(this.tabsPage);
          })
        }
      }
      else {
        this.storage.set('logadoAlbum', 'sim');
        this.storage.set('uid', res.uid);
        this.fcm.getToken().then(token => {
          this.afDB.object('Tokens/' + res.uid + '/' + token).set({
            fcmToken: token
          });
        })
        this.afDB.object('Usuarios/' + res.uid).update({
          foto: 'https://firebasestorage.googleapis.com/v0/b/app-album.appspot.com/o/default-user-icon.png?alt=media&token=a9e8d537-eafa-45d5-b0d0-c979a6c172f1',
          nome: res.name,
          total: 0
        })
        .then(() => {
          loader.dismiss();
          this.navCtrl.setRoot(this.tabsPage);
        })
      }
    });

  }

  salvarLogin(res){
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    //Pegar figurinhas que já tem
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    //Request usuario
    let url2 = 'https://app-album.firebaseio.com/Usuarios/' + res.uid + '.json';
    this.http.get(url2, { headers: headers }).subscribe(data => {
      if(data){
        let datares = JSON.parse(JSON.stringify(data));
        if(JSON.parse(JSON.stringify(data)).total){
          this.storage.set('logadoAlbum', 'sim');
          this.storage.set('uid', res.uid);
          //FCM
          this.fcm.getToken().then(token => {
            this.afDB.object('Tokens/' + res.uid + '/' + token).set({
                token: token
            });
          })

          this.afDB.object('Usuarios/' + res.uid).update({
            foto: 'https://firebasestorage.googleapis.com/v0/b/app-album.appspot.com/o/default-user-icon.png?alt=media&token=a9e8d537-eafa-45d5-b0d0-c979a6c172f1',
            nome: datares.name,
          })
          .then(() => {
            loader.dismiss();
            this.navCtrl.setRoot(this.tabsPage);
          })
        }
        else {
          this.storage.set('logadoAlbum', 'sim');
          this.storage.set('uid', res.uid);
          this.fcm.getToken().then(token => {
            this.afDB.object('Tokens/' + res.uid + '/' + token).set({
                token: token
            });
          })

          this.afDB.object('Usuarios/' + res.uid).update({
            foto: 'https://firebasestorage.googleapis.com/v0/b/app-album.appspot.com/o/default-user-icon.png?alt=media&token=a9e8d537-eafa-45d5-b0d0-c979a6c172f1',
            nome: datares.name,
            total: 0
          })
          .then(() => {
            loader.dismiss();
            this.navCtrl.setRoot(this.tabsPage);
          })
        }
      }
    });

  }

  // facebookLogin() {
  //   this.storage.set('logadoAlbum', 'sim');
  //   this.storage.set('uid', 'Jdw2GqIu0HRTc4vFXI8RKRJ4xzz1');
  //   this.navCtrl.setRoot(this.tabsPage);
  // }
  

  ionViewDidLoad() {
  }

}
