import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

//Pages
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { AlbumPage } from '../pages/album/album';
import { RankingPage } from '../pages/ranking/ranking';
import { PerfilPage } from '../pages/perfil/perfil';
import { EventosPage } from '../pages/eventos/eventos';
import { EventoPage } from '../pages/evento/evento';
import { NovoEventoPage } from '../pages/novo-evento/novo-evento';
import { RepetidasPage } from '../pages/repetidas/repetidas';
import { ChatPage } from '../pages/chat/chat';
import { ContaPage } from '../pages/conta/conta';
import { MensagensPage } from '../pages/mensagens/mensagens';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//Firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
export const firebaseConfig = {
  apiKey: "AIzaSyD4Mp_SzVg3S_v34qW941CXW4uPG-y4lEE",
  authDomain: "app-album.firebaseapp.com",
  databaseURL: "https://app-album.firebaseio.com",
  projectId: "app-album",
  storageBucket: "app-album.appspot.com",
  messagingSenderId: "619285745305"
};

//HTTP
import { HttpClientModule } from '@angular/common/http';
//Plugins
import { Facebook } from '@ionic-native/facebook';
import { IonicStorageModule } from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing';
import { FCM } from '@ionic-native/fcm';
import { Camera } from '@ionic-native/camera';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    AlbumPage,
    RankingPage,
    PerfilPage,
    EventosPage,
    NovoEventoPage,
    EventoPage,
    RepetidasPage,
    ChatPage,
    MensagensPage,
    ContaPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    IonicStorageModule.forRoot(),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    AlbumPage,
    RankingPage,
    PerfilPage,
    EventosPage,
    NovoEventoPage,
    EventoPage,
    RepetidasPage,
    ChatPage,
    MensagensPage,
    ContaPage
  ],
  providers: [
    Camera,
    FCM,
    SocialSharing,
    AngularFireAuth,
    Facebook,    
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
