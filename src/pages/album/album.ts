import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
 
@Component({
  selector: 'page-album',
  templateUrl: 'album.html',
})
export class AlbumPage {

  figurinhas = [];
  figurinhasTem = [];
  uid;
  totalFigurinhas;
  figurinhasFaltam = [];;
  tipo = 'tudo';
  user;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afDB: AngularFireDatabase,
    private storage: Storage,
    private http: HttpClient,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController
  ) {
    //Montar álbum
    let i = 0;
    for(i; i<682; i++){
      let card = {numero: i};
      this.figurinhas.push(card);
    }

    //UID
    this.storage.get('uid').then((val) => {
      let loader = this.loadingCtrl.create({
      });
      loader.present();

      this.uid = val;
      //Pegar figurinhas que já tem
      let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      //Request usuario
      let url2 = 'https://app-album.firebaseio.com/Usuarios/' + val + '.json';
      this.http.get(url2, { headers: headers }).subscribe(data => {
        if((JSON.parse(JSON.stringify(data)).total != null) && (JSON.parse(JSON.stringify(data)).total != undefined)){
          this.totalFigurinhas = JSON.parse(JSON.stringify(data)).total;
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
        else {
          loader.dismiss();
        }
      });
    });
  }

  doRefresh(refresher) {
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
      //Dismiss refresh
      refresher.complete();
  }

  ionViewDidLoad() {
  }

  marcar(f){
    let num = f.numero;
    //Se ja tiver
    if(f.tem === 'sim'){
      f.tem = 'nao';
      //Remover
      this.afDB.object('Usuarios/' + this.uid + '/Figurinhas/' + f.key).remove()
      .then(() => {
        this.total();
        let toast = this.toastCtrl.create({
          message: 'Figurinha ' + num + ' removida do álbum com sucesso.',
          duration: 2000
        });
        toast.present();
      })
    }
    else {
      f.tem = 'sim';
      this.afDB.list('Usuarios/' + this.uid + '/Figurinhas').push({
        num: num
      })
      .then((res) => {
        f.key = res.key;
        this.total();
        let toast = this.toastCtrl.create({
          message: 'Figurinha ' + num + ' adicionada ao álbum com sucesso.',
          duration: 2000
        });
        toast.present();
      })
    }
  }

  total(){
    let array = [];
    let i = 0;
    for(i; i<this.figurinhas.length; i++){
      if(this.figurinhas[i].tem === 'sim'){
        array.push(this.figurinhas[i]);
      }
    };

    //Atualizar figurinhas que faltam e coladas
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
    }
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

    this.totalFigurinhas = array.length;
    //Atualizar total no db
    this.afDB.object('Usuarios/' + this.uid).update({
      total: this.totalFigurinhas
    });
  }

}
