import { Component, keyframes } from '@angular/core';
import { IonicPage, NavController, NavParams,  ToastController, LoadingController, ViewController } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase } from 'angularfire2/database';
import { SocialSharing } from '@ionic-native/social-sharing';
 
@Component({
  selector: 'page-evento',
  templateUrl: 'evento.html',
})
export class EventoPage {

  evento;
  confirmados = 0;
  uid;
  confirmado = true;
  key;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private http: HttpClient,
    private storage: Storage,
    private afDB: AngularFireDatabase,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public view: ViewController,
    private socialSharing: SocialSharing
  ) {
    this.evento = this.navParams.get('evento');
    if((this.evento.$key === null) || this.evento.$key === undefined){
      this.key = this.evento;
      //Pegar figurinhas que já tem
      let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      //Request usuario
      let url2 = 'https://app-album.firebaseio.com/Eventos/' + this.key + '.json';
      this.http.get(url2, { headers: headers }).subscribe(data => {
          this.evento = data;
          this.evento.$key = this.key;
          this.verificar();
          this.atualizar();
          console.log(this.evento);
      })
    }
    console.log(this.evento);

    this.getUid();
    this.atualizar();


  }

  fechar(){
    this.view.dismiss()
  }

   //Social sharing
   compartilhar(){
    this.storage.get('uid').then((val) => {
      this.socialSharing.share('Já completou seu álbum? Confirme sua presença e venha trocar suas figurinhas nesse evento: ', null, null, 'https://stickermanager.app.link/evento?evento=' + this.evento.$key);
    })
  }

  excluir(){
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    this.afDB.object('Eventos/' + this.evento.$key).remove()
    .then(() => {
      loader.dismiss();
      this.fechar();
      let toast = this.toastCtrl.create({
        message: 'Evento excluído com sucesso.',
        duration: 2000
      });
      toast.present();
    })
  }

  atualizar(){
    //Pegar figurinhas que já tem
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    //Request usuario
    let url2 = 'https://app-album.firebaseio.com/Eventos/' + this.evento.$key + '/Confirmados.json';
    this.http.get(url2, { headers: headers }).subscribe(data => {
      console.log(data);
      if(data != null){
        let array = [];
        Object.keys(data).forEach( key => {
          array.push(data[key]);
        })
        this.confirmados = array.length;
      }
      else {
        this.confirmados = 0;
      }
    });
  }

  cancelar(){
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    this.afDB.object('Eventos/' + this.evento.$key + '/Confirmados/' + this.uid).remove()
    .then((res) => {
      this.afDB.object('Usuarios/' + this.uid + '/Eventos/' + this.evento.$key).remove()
      .then(() => {
        loader.dismiss();
        let toast = this.toastCtrl.create({
          message: 'Presença cancelada!',
          duration: 2000
        });
        toast.present();
        this.atualizar();
        this.confirmado = false;
      })
    })
  }

  getUid(){
    this.storage.get('uid').then((uid) => {
      this.uid = uid;
      console.log("UID: " + this.uid);
      this.verificar();
    });
  }

  //Se já tem presença confirmada nesse evento
  verificar(){
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    //Pegar figurinhas que já tem
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    //Request usuario
    let url2 = 'https://app-album.firebaseio.com/Usuarios/' + this.uid + '/Eventos/' + this.evento.$key + '.json';
    this.http.get(url2, { headers: headers }).subscribe(data => {
      loader.dismiss();
      console.log(data);
      if(data != null){
        this.confirmado = true;
      }
      else {
        this.confirmado = false;
      }
    });
  }

  confirmar(){
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    this.afDB.object('Eventos/' + this.evento.$key + '/Confirmados/' + this.uid).set({
      uid: this.uid
    })
    .then((res) => {
      this.afDB.object('Usuarios/' + this.uid + '/Eventos/' + this.evento.$key).set({
        evento: this.evento.$key
      })
      .then(() => {
        loader.dismiss();
        let toast = this.toastCtrl.create({
          message: 'Presença confirmada!',
          duration: 2000
        });
        toast.present();
        this.atualizar();
        this.confirmado = true;
      })
    })
  }

  ionViewDidLoad() {
  }

}
