import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';

import { Storage } from '@ionic/storage';
import { PerfilPage } from '../pages/perfil/perfil';
import { EventoPage } from '../pages/evento/evento';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { FCM } from '@ionic-native/fcm';

declare var Branch;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  
  @ViewChild(Nav) nav: Nav;
  rootPage: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage, public modalCtrl: ModalController, private fcm: FCM,  private afDB: AngularFireDatabase) {
    
    this.storage.get('logadoAlbum').then((val) => {
      if(val === 'sim') {
        this.rootPage = TabsPage;

        this.storage.get('uid').then((uid) => {
          //FCM
          this.fcm.getToken().then(token => {
          this.afDB.object('Tokens/' + uid + '/' + token).set({
            fcmToken: token
          });
        })
      });
      }
      else {
        this.rootPage = LoginPage;
      }
    });

    platform.ready().then(() => {
      //Deeplinks
      branchInit();

      statusBar.styleDefault();
      splashScreen.hide();
    });
  
    platform.resume.subscribe(() => {
      branchInit();
    });

    // Branch initialization
    const branchInit = () => {
      // only on devices
      if (!platform.is('cordova')) { return }
      const Branch = window['Branch'];
      Branch.initSession(data => {
        if (data['+clicked_branch_link']) {
          if(data.$marketing_title === 'Perfil'){
            this.nav.setRoot(TabsPage);
            let modal = this.modalCtrl.create(PerfilPage, {uid: data.id, visita: 'sim'});
            modal.present();
          }
          else if(data.$marketing_title === 'Evento'){
            this.nav.setRoot(TabsPage);
            let modal = this.modalCtrl.create(EventoPage, {evento: data.evento});
            modal.present();
          }
        }
      });
    }
  }
}
