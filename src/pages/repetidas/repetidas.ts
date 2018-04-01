import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Gesture } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

 
@Component({
  selector: 'page-repetidas',
  templateUrl: 'repetidas.html',
})
export class RepetidasPage {

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
      let card = {numero: i, qnt: 0};
      this.figurinhas.push(card);
    }

    //UID
    this.storage.get('uid').then((val) => {
      let loader = this.loadingCtrl.create({
      });
      loader.present();

      this.uid = val;
      //Pegar figurinhas que já repetida
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
      let url = 'https://app-album.firebaseio.com/Usuarios/' + val + '/Repetidas.json';
      console.log(url);
      this.http.get(url, { headers: headers }).subscribe(data => {
        if(data != null){
          Object.keys(data).forEach( key => {
            let u = 0;
            for(u; u < this.figurinhas.length; u++){
              let numeroArray = this.figurinhas[u].numero;
              if(data[key].num === numeroArray){
                this.figurinhas[u].repetida = "sim";
                this.figurinhas[u].qnt = data[key].qnt;
                this.figurinhas[u].key = key;
              }
            }
          });

          loader.dismiss();
          console.log(this.figurinhas);

          this.figurinhasFaltam = [];
          let o = 0;
          for(o; o < this.figurinhas.length; o++){
            if(
              (this.figurinhas[o].repetida != 'sim') || 
              (this.figurinhas[o].repetida === undefined) || 
              (this.figurinhas[o].repetida === null)
            )
            {
              this.figurinhasFaltam.push(this.figurinhas[o]);
            }
          };
          this.figurinhasTem = [];
          let a = 0;
          for(a; a < this.figurinhas.length; a++){
            if(
              (this.figurinhas[a].repetida === 'sim')
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

  ionViewDidLoad() {

}

doRefresh(refresher) {
  this.navCtrl.setRoot(this.navCtrl.getActive().component);
    //Dismiss refresh
    refresher.complete();
}

  marcar(f){
    let num = f.numero;
    //Se ja tiver
    if(f.repetida === 'sim'){
      f.repetida = 'sim';
      f.qnt = f.qnt + 1;
      //Atualizar qnt
      this.afDB.object('Usuarios/' + this.uid + '/Repetidas/' + f.key).update({
        qnt: f.qnt
      })
      .then(() => {
        this.total();
        let toast = this.toastCtrl.create({
          message: 'Figurinha ' + num + ' atualizada com sucesso.',
          duration: 2000
        });
        toast.present();
      })
    }
    else {
      f.repetida = 'sim';
      f.qnt = f.qnt + 1;
      this.afDB.list('Usuarios/' + this.uid + '/Repetidas').push({
        num: num,
        qnt: 1
      })
      .then((res) => {
        f.key = res.key;
        this.total();
        let toast = this.toastCtrl.create({
          message: 'Figurinha ' + num + ' atualizada com sucesso.',
          duration: 2000
        });
        toast.present();
      })
    }
  }

  remover(f){
    let num = f.numero;
    //Se ja tiver
    if(f.repetida === 'sim'){
      if(f.qnt != 1){
        f.repetida = 'sim';
        f.qnt = f.qnt - 1;
        //Atualizar qnt
        this.afDB.object('Usuarios/' + this.uid + '/Repetidas/' + f.key).update({
          qnt: f.qnt
        })
        .then(() => {
          this.total();
          let toast = this.toastCtrl.create({
            message: 'Figurinha ' + num + ' atualizada com sucesso.',
            duration: 2000
          });
          toast.present();
        })
      }
      else {
        f.repetida = 'nao';
        f.qnt = 0;
        //Atualizar qnt
        this.afDB.object('Usuarios/' + this.uid + '/Repetidas/' + f.key).remove()
        .then(() => {
          this.total();
          let toast = this.toastCtrl.create({
            message: 'Figurinha ' + num + ' removida com sucesso.',
            duration: 2000
          });
          toast.present();
        })
      }
    }
    else {
      let toast = this.toastCtrl.create({
        message: 'A figurinha ' + num + ' não é repetida.',
        duration: 2000
      });
      toast.present();
    }
  }

  total(){
    let array = [];
    let i = 0;
    for(i; i<this.figurinhas.length; i++){
      if(this.figurinhas[i].repetida === 'sim'){
        array.push(this.figurinhas[i]);
      }
    };

    //Atualizar figurinhas que faltam e coladas
    this.figurinhasFaltam = [];
    let o = 0;
    for(o; o < this.figurinhas.length; o++){
      if(
        (this.figurinhas[o].repetida != 'sim') || 
        (this.figurinhas[o].repetida === undefined) || 
        (this.figurinhas[o].repetida === null)
      )
      {
        this.figurinhasFaltam.push(this.figurinhas[o]);
      }
    }
    this.figurinhasTem = [];
    let a = 0;
    for(a; a < this.figurinhas.length; a++){
      if(
        (this.figurinhas[a].repetida === 'sim')
      )
      {
        this.figurinhasTem.push(this.figurinhas[a]);
      }
    }
  }


}
