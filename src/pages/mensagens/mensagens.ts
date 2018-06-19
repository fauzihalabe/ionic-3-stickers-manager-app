import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController, ToastController, ViewController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { PerfilPage } from '../perfil/perfil';
import "rxjs/add/operator/map";
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ChatPage } from '../chat/chat';

@Component({
  selector: 'page-mensagens',
  templateUrl: 'mensagens.html',
})
export class MensagensPage {

  users = [];
  perfilPage: PerfilPage;
  inputFiltro: any;
  uid;
  seguindoLista = [];
  seguidoresLista = [];
  amigos = [];
  tipo: any;;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afDB: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private storage: Storage,
    private http: HttpClient,
    public toastCtrl: ToastController,
    public view: ViewController
  ) {
    this.uid = this.navParams.get('uid');
  }

  doRefresh(refresher) {
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
    //Dismiss refresh
    setTimeout(() => {
      refresher.complete();
    }, 1000)
    
  }

  ionViewDidLoad() {
    this.getUsers();
    this.getFriends();
  }

  getFriends(){
    console.log("UID" + this.uid);
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    let url = 'https://app-album.firebaseio.com/Chats/' + this.uid + '.json';
    this.http.get(url, { headers: headers }).subscribe(data => {
      this.amigos = [];
      if(data != null){
        Object.keys(data).forEach( key => {
          this.amigos.push({key: key});
        });

        console.log(this.amigos);
      }
    })
  }

  fechar(){
    this.view.dismiss()
  }

  getUsers(){
    this.users = [];

    let loader = this.loadingCtrl.create({
    });
    loader.present();

    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    //Request usuario
    let url = 'https://app-album.firebaseio.com/Usuarios/.json';
    this.http.get(url, { headers: headers }).subscribe(data => {
      if(data != null){
        Object.keys(data).forEach( key => {
          // this.users.push(data[key]);
          let obj = {$key: key, foto: data[key].foto, nome: data[key].nome, total: data[key].total}
          this.users.push(obj);
        });
      }
    },
    err => {

    },
    () => {
      loader.dismiss();
      // console.log(this.users);
      // console.log(this.users.sort());
      this.users.sort(function(a, b) { 
        return - ( a.total - b.total );
      });
    }
  );
  }

  verificar(user){
    let res: boolean;
    let i = 0;
    for(i; i < this.amigos.length; i++){
      if(this.amigos[i].key === user.$key){
        res = true;
      } 
    }
    return res;
  }

  //Open chat
  abrir(user){
    let friendUser = user.$key;
    let currentUser = this.uid;

    let modal = this.modalCtrl.create(ChatPage, {currentUser: currentUser, friendUser: friendUser, friendInfo: user});
    modal.present();

  }

}
