import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, LoadingController  } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';

 
@Component({
  selector: 'page-novo-evento',
  templateUrl: 'novo-evento.html',
})
export class NovoEventoPage {

  evento = {
    dia: '',
    horario: '',
    endereco: '',
    estado: '',
    cidade: '',
    criador: ''
  }

  constructor(
    private storage: Storage,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public view: ViewController,
    private afDB: AngularFireDatabase,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController
  ) {
  }

  criar(){
    this.storage.get('uid').then((uid) => {
      this.evento.criador = uid;
      if(
        (this.evento.dia != '') &&
        (this.evento.horario != '') &&
        (this.evento.endereco != '') &&
        (this.evento.cidade != '') &&
        (this.evento.estado != '')
      ){
        let loader = this.loadingCtrl.create({
        });
        loader.present();
        this.afDB.list("Eventos").push(this.evento)
        .then(() => {
          loader.dismiss();
          let toast = this.toastCtrl.create({
            message: 'Evento criado com sucesso.',
            duration: 2000
          });
          toast.present();
          this.view.dismiss()
        })
      }
      else {
        let toast = this.toastCtrl.create({
          message: 'Ops. Preencha tudo antes de continuar.',
          duration: 2000
        });
        toast.present();
      }
    })
  }

  cancelar(){
    this.view.dismiss()
  }

  ionViewDidLoad() {
  }

}
