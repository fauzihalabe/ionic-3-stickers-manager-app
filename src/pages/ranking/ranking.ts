import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController, ToastController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { PerfilPage } from '../perfil/perfil';
import "rxjs/add/operator/map";
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

@Component({
  selector: 'page-ranking',
  templateUrl: 'ranking.html',
})
export class RankingPage {

  // users: FirebaseListObservable<any[]>;
  users = [];
  perfilPage: PerfilPage;
  inputFiltro: any;
  uid;
  seguindoLista = [];
  seguidoresLista = [];
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
  ) {
    this.getUID();
  }

  doRefresh(refresher) {
      this.refresh();
      //Dismiss refresh
      setTimeout(() => {
        this.navCtrl.setRoot(this.navCtrl.getActive().component);
        // refresher.complete();
      }, 3000)
      
  }

  refresh(){
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

    // this.users = this.afDB.list('Usuarios', {
    //   query: {
    //     orderByChild: 'total'
    //   }
    // }).map((array) => array.reverse()) as FirebaseListObservable<any[]>;
  }

  ionViewDidLoad() {
    this.tipo = 'todos';
    this.filtroEvento();
  }

  filtroEvento(){
    setTimeout(() => {
      //Adicionar evento ao input filtro
      var inp = document.getElementsByClassName("filtro")[0];
      inp.addEventListener("input", () => {
        let val = this.inputFiltro;
        this.filtrar(val);
      });
    }, 100)
  }

  //Filtro de colecionadores
  filtrar(val){
    let row = document.getElementsByClassName("itemColecionador");
    let qnt = row.length;
    console.log(row);

    //Loop
    for(let i = 0; i < qnt; i++) {
      let valor = row[i].childNodes[1].childNodes[0].childNodes[1].childNodes[2].textContent;

      if(val != undefined){
        if(valor.toUpperCase().includes(val.toUpperCase()) == true){
          row[i].classList.remove("esconder");
        }

        else{
          row[i].classList.add("esconder");
        }
      }
      else {
        row[i].classList.remove("esconder");
      }
    }
  }

  abrir(user){
    let modal = this.modalCtrl.create(PerfilPage, {uid: user.$key, visita: 'sim'});
    modal.present();
  }

  getUID(){
    this.storage.get('uid').then((val) => {
      this.uid = val;
      this.seguindo();
      this.seguidores();
      //Carregar dados
      this.refresh();
    })
  }

  //Listar quem estou seguindo
  seguindo(){
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // //Request usuario
    // let url = 'https://app-album.firebaseio.com/Usuarios/' + this.uid + '/Seguindo.json';
    // this.http.get(url, { headers: headers }).subscribe(data => {
    //   if(data != null){
    //     Object.keys(data).forEach( key => {
    //       this.seguindoLista = [];
    //       this.seguindoLista.push(data[key]);
    //     });
    //   }
    // });
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    let url = 'https://app-album.firebaseio.com/Usuarios/' + this.uid + '/Seguindo.json';
    this.http.get(url, { headers: headers }).subscribe(data => {
      this.seguindoLista = [];
      if(data != null){
        Object.keys(data).forEach( key => {
          this.seguindoLista.push(data[key]);
        });
      }
    })
  }

  //Listar quem está me seguindo
  seguidores(){
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // //Request usuario
    // let url = 'https://app-album.firebaseio.com/Usuarios/' + this.uid + '/Seguidores.json';
    // this.http.get(url, { headers: headers }).subscribe(data => {
    //   this.seguidoresLista = [];
    //   if(data != null){
    //     Object.keys(data).forEach( key => {
    //       this.seguidoresLista.push(data[key]);
    //       console.log(this.seguidoresLista);
    //     });
    //   }
    // });
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    let url = 'https://app-album.firebaseio.com/Usuarios/' + this.uid + '/Seguidores.json';
    this.http.get(url, { headers: headers }).subscribe(data => {
      this.seguidoresLista = [];
      if(data != null){
        Object.keys(data).forEach( key => {
          this.seguidoresLista.push(data[key]);
        });
      }
    })
  }

  seguindoVerificar(user){
    let res: boolean;
    let i = 0;
    for(i; i < this.seguindoLista.length; i++){
      if(this.seguindoLista[i].friend === user.$key){
        res = true;
      } 
    }
    return res;
  }

  seguidoresVerificar(user){
    let res: boolean;
    let i = 0;
    for(i; i < this.seguidoresLista.length; i++){
      if(this.seguidoresLista[i].friend === user.$key){
        res = true;
      } 
    }
    return res;
  }

  //Seguir
  follow(user){
    //Criar loading
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    //Seguindo
    this.afDB.object('Usuarios/' + this.uid + '/Seguindo/' + user.$key).set({
      seguindo: 'sim',
      friend: user.$key
    })
    .then(() => {
      //Me marcar como seguidor
      this.afDB.object('Usuarios/' +  user.$key + '/Seguidores/' + this.uid).set({
        seguidor: 'sim',
        friend: this.uid
      })
      .then(() => {
         //Atualizar seguidores
         this.seguidores();
         //Atualizar quem estou seguindo
         let headers = new HttpHeaders()
         .set('Content-Type', 'application/json')
         //Request usuario
         let url = 'https://app-album.firebaseio.com/Usuarios/' + this.uid + '/Seguindo.json';
         this.http.get(url, { headers: headers }).subscribe(data => {
          this.seguindoLista = [];
           if(data != null){
             Object.keys(data).forEach( key => {
               this.seguindoLista.push(data[key]);
             });

            //Explodir loading
            loader.dismiss();
            //Mensagem de sucesso
            let toast = this.toastCtrl.create({
              message: 'Você está seguindo ' + user.nome + '.',
              duration: 2000
            });
            toast.present();
            }
            else {
               //Explodir loading
              loader.dismiss();
              //Mensagem de sucesso
              let toast = this.toastCtrl.create({
                message: 'Você deixou de seguir ' + user.nome + '.',
                duration: 2000
              });
              toast.present();
            }
          });
      })
    })
  }

   //Deixar de seguir
   unfollow(user){
    //Criar loading
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    //Deixar de seguir
    this.afDB.object('Usuarios/' + this.uid + '/Seguindo/' + user.$key).remove()
    .then(() => {
      //Me desmarcar como seguidor
      this.afDB.object('Usuarios/' +  user.$key + '/Seguidores/' + this.uid).remove()
      .then(() => {
        //Atualizar seguidores
        this.seguidores();
        //Atualizar quem estou seguindo
        let headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        //Request usuario
        let url = 'https://app-album.firebaseio.com/Usuarios/' + this.uid + '/Seguindo.json';
        this.http.get(url, { headers: headers }).subscribe(data => {
          this.seguindoLista = [];
          if(data != null){
            Object.keys(data).forEach( key => {
              this.seguindoLista.push(data[key]);
            });

            //Explodir loading
            loader.dismiss();
            //Mensagem de sucesso
            let toast = this.toastCtrl.create({
              message: 'Você deixou de seguir ' + user.nome + '.',
              duration: 2000
            });
            toast.present();
          }
          else {
             //Explodir loading
             loader.dismiss();
             //Mensagem de sucesso
             let toast = this.toastCtrl.create({
               message: 'Você deixou de seguir ' + user.nome + '.',
               duration: 2000
             });
             toast.present();
          }
        });
      })
    })
  }


}
