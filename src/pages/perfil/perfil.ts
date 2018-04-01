import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { SocialSharing } from '@ionic-native/social-sharing';
 
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {

  figurinhas = [];
  figurinhasTem = [];
  uid;
  totalFigurinhas;
  figurinhasFaltam = [];
  repetidas = [];
  tipo = 'tudo';
  user = {
    foto: '',
    nome: ''
  };
  visita = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afDB: AngularFireDatabase,
    private storage: Storage,
    private http: HttpClient,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public view: ViewController,
    private socialSharing: SocialSharing
  ) {
    //Montar álbum
    let i = 0;
    for(i; i<682; i++){
      let card = {numero: i};
      this.figurinhas.push(card);
    }

    //UID
      let val;
      let visita = this.navParams.get("visita");
      if(visita === 'sim'){
        this.visita = true;
        val = this.navParams.get("uid");
        this.organizarDados(val);
      }
      else {
        this.storage.get('uid').then((val) => {
          let loader = this.loadingCtrl.create({
          });
          loader.present();
          //Pegar figurinhas que já tem
          let headers = new HttpHeaders()
          .set('Content-Type', 'application/json')
          //Request usuario
          let url2 = 'https://app-album.firebaseio.com/Usuarios/' + val + '.json';
          this.http.get(url2, { headers: headers }).subscribe(data => {
            if((JSON.parse(JSON.stringify(data)).total != null) && (JSON.parse(JSON.stringify(data)).total != undefined)){
              this.user.nome = JSON.parse(JSON.stringify(data)).nome;
              this.user.foto = JSON.parse(JSON.stringify(data)).foto;
              this.totalFigurinhas = JSON.parse(JSON.stringify(data)).total;
            }
          });

          // Request repetidas
          let urlRepetidas = 'https://app-album.firebaseio.com/Usuarios/' + val + '/Repetidas.json';
          this.http.get(urlRepetidas, { headers: headers }).subscribe(data => {
            if(data != null){
              Object.keys(data).forEach( key => {
                this.repetidas.push(data[key]);
              });
            }
          });
      
          // Request figurinhas
          let url = 'https://app-album.firebaseio.com/Usuarios/' + val + '/Figurinhas.json';
          console.log(url);
          this.http.get(url, { headers: headers }).subscribe(data => {
            if(data != null){
              Object.keys(data).forEach( key => {
                let u = 0;
                for(u; u < this.figurinhas.length; u++){
                  let numeroArray = this.figurinhas[u].numero;
                  if(data[key].num === numeroArray){
                    this.figurinhas[u].tem = "sim";
                    this.figurinhas[u].key = key;
                  }
                }
              });
      
              loader.dismiss();
      
              this.figurinhasFaltam = [];
              let o = 0;
              for(o; o < this.figurinhas.length; o++){
                if(
                  (this.figurinhas[o].tem != 'sim') || 
                  (this.figurinhas[o].tem === undefined) || 
                  (this.figurinhas[o].tem === null)
                )
                {
                  this.figurinhasFaltam.push(this.figurinhas[o]);
                }
              };
              this.figurinhasTem = [];
              let a = 0;
              for(a; a < this.figurinhas.length; a++){
                if(
                  (this.figurinhas[a].tem === 'sim')
                )
                {
                  this.figurinhasTem.push(this.figurinhas[a]);
                }
              }
            }
          });
        });
      }
      };
    

  fechar(){
    this.view.dismiss()
  }

  //Social sharing
  compartilhar(){
    this.storage.get('uid').then((val) => {
      this.socialSharing.share('Veja o perfil de ' + this.user.nome + ' no app Sticker Manager!', null, null, 'https://stickermanager.app.link/perfil?id=' + val);
    })
  }

  doRefresh(refresher) {
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
      //Dismiss refresh
      refresher.complete();
  }

  ionViewDidLoad() {
  }

  organizarDados(val){
    let loader = this.loadingCtrl.create({
    });
    loader.present();
    //Pegar figurinhas que já tem
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    //Request usuario
    let url2 = 'https://app-album.firebaseio.com/Usuarios/' + val + '.json';
    this.http.get(url2, { headers: headers }).subscribe(data => {
      if((JSON.parse(JSON.stringify(data)).total != null) && (JSON.parse(JSON.stringify(data)).total != undefined)){
        this.user.nome = JSON.parse(JSON.stringify(data)).nome;
        this.user.foto = JSON.parse(JSON.stringify(data)).foto;
        this.totalFigurinhas = JSON.parse(JSON.stringify(data)).total;
      }
    });

     // Request repetidas
     let urlRepetidas = 'https://app-album.firebaseio.com/Usuarios/' + val + '/Repetidas.json';
     this.http.get(urlRepetidas, { headers: headers }).subscribe(data => {
       if(data != null){
         Object.keys(data).forEach( key => {
           this.repetidas.push(data[key]);
         });
       }
     });

    // Request figurinhas
    let url = 'https://app-album.firebaseio.com/Usuarios/' + val + '/Figurinhas.json';
    console.log(url);
    this.http.get(url, { headers: headers }).subscribe(data => {
      if(data != null){
        Object.keys(data).forEach( key => {
          let u = 0;
          for(u; u < this.figurinhas.length; u++){
            let numeroArray = this.figurinhas[u].numero;
            if(data[key].num === numeroArray){
              this.figurinhas[u].tem = "sim";
              this.figurinhas[u].key = key;
            }
          }
        });

        loader.dismiss();

        this.figurinhasFaltam = [];
        let o = 0;
        for(o; o < this.figurinhas.length; o++){
          if(
            (this.figurinhas[o].tem != 'sim') || 
            (this.figurinhas[o].tem === undefined) || 
            (this.figurinhas[o].tem === null)
          )
          {
            this.figurinhasFaltam.push(this.figurinhas[o]);
          }
        };
        this.figurinhasTem = [];
        let a = 0;
        for(a; a < this.figurinhas.length; a++){
          if(
            (this.figurinhas[a].tem === 'sim')
          )
          {
            this.figurinhasTem.push(this.figurinhas[a]);
          }
        }
      }
    });
  }

}
