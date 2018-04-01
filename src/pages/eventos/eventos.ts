import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController } from 'ionic-angular';
import { NovoEventoPage } from '../novo-evento/novo-evento';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { EventoPage } from '../evento/evento';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

 
@Component({
  selector: 'page-eventos',
  templateUrl: 'eventos.html',
})
export class EventosPage {

  eventos: FirebaseListObservable<any[]>;
  uid;
  tipo = 'tudo';
  meuEventos = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private afDB: AngularFireDatabase,
    private storage: Storage,
    private http: HttpClient
  ) {
    let loader = this.loadingCtrl.create({
      duration: 2000
    });
    loader.present();

    this.eventos = this.afDB.list('Eventos', {
      query: {
        orderBy: 'dia'
      }
    });

    this.uidGet();

  }

  doRefresh(refresher) {
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
      //Dismiss refresh
      refresher.complete();
  }

  uidGet(){
    this.storage.get('uid').then((val) => {
      this.uid = val;
      this.meuEventos = [];
      //Request eventos confirmados
     let headers = new HttpHeaders()
     let url = 'https://app-album.firebaseio.com/Usuarios/' + val + '/Eventos.json';
     console.log(url);
     this.http.get(url, { headers: headers }).subscribe(data => {
      if(data != null){
        Object.keys(data).forEach( key => {
          this.meuEventos.push(data[key]);
          console.log(this.meuEventos);
        });
      }
    });
    })
  }

  eventoConfirmado(evento){
    let res: boolean;
    let i = 0;
    for(i; i < this.meuEventos.length; i++){
      if(this.meuEventos[i].evento === evento.$key){
        res = true;
      } 
    }

    return res;
  }

  criar(){
    let modal = this.modalCtrl.create(NovoEventoPage);
    modal.present();
  }

  abrir(evento){
    console.log(evento);
    let modal = this.modalCtrl.create(EventoPage, {evento: evento});
    modal.present();

    modal.onDidDismiss(data => {
      this.uidGet();
      console.log("Fechou o modal")
    });
  }

  ionViewDidLoad() {
  }

}
