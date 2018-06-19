import { Component, ViewChild, NgZone  } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController, LoadingController, Content } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import "rxjs/add/operator/map";

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  mensagens: FirebaseListObservable<any[]>;
  currentUser;
  friendUser;
  friendInfo = {};
  mensagem = '';
  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afDB: AngularFireDatabase,
    public view: ViewController,
    public loadingCtrl: LoadingController
  ) {
    this.currentUser = this.navParams.get('currentUser');
    this.friendUser = this.navParams.get('friendUser');
    this.friendInfo = this.navParams.get('friendInfo');
    console.log(this.friendInfo);

    this.mensagens = this.afDB.list('Chats/' + this.currentUser + '/' + this.friendUser);
  }

  fechar(){
    this.view.dismiss()
  }

  scroll(){
    //Scroll to latest message
    this.mensagens.subscribe(snapshots => {
      setTimeout(() => {
        this.content.scrollToBottom(300);
      }, 500)
    })
  }

  sendMessage(){
    let loader = this.loadingCtrl.create({
    });
    loader.present();
    
    let date = new Date().toLocaleString();

    //Criar para o usuário logado
    if(this.mensagem != ''){
      this.afDB.list('Chats/' + this.currentUser + '/' + this.friendUser).push({
        mensagem: this.mensagem,
        currentUser: this.currentUser,
        friendUser: this.friendUser,
        data: date
      }).then(() => {
        //Criar para o usuário amigo
        this.afDB.list('Chats/' + this.friendUser + '/' + this.currentUser).push({
          mensagem: this.mensagem,
          friendUser: this.friendUser,
          currentUser: this.currentUser,
          data: date
        })
      })
      .then(() => {
        loader.dismiss();
        this.mensagem = '';
      })
    }
  }

  ionViewDidLoad() {
    //Scroll to latest message
    this.mensagens.subscribe(snapshots => {
      setTimeout(() => {
        this.content.scrollToBottom(300);
      }, 500)
    })
  }

}
