import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, ViewController, ModalController, App } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ChatPage } from '../chat/chat';
import { MensagensPage } from '../mensagens/mensagens';
import { LoginPage } from '../login/login';
import { Camera, CameraOptions } from '@ionic-native/camera';
import * as firebase from 'firebase';

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
  userUid;
  avatar = 'https://firebasestorage.googleapis.com/v0/b/app-album.appspot.com/o/default-user-icon.png?alt=media&token=a9e8d537-eafa-45d5-b0d0-c979a6c172f1';
  foto;
  public myPhotosRef = firebase.storage().ref('/fotos/');
  public myPhoto: any;
  public myPhoto2: any;
  public myPhotoURL: any;
  loader;
  userId;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afDB: AngularFireDatabase,
    private storage: Storage,
    private http: HttpClient,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public view: ViewController,
    private socialSharing: SocialSharing,
    public modalCtrl: ModalController,
    private camera: Camera,
    public app: App
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
        this.userUid = val;
        this.organizarDados(val);
      }
      else {
        this.storage.get('uid').then((val) => {
          console.log(val);
          this.save(val);
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

              this.check(JSON.parse(JSON.stringify(data)).foto).subscribe((res) => {
              },
              err => {
                if(err.status === 200){
                  this.user.nome = JSON.parse(JSON.stringify(data)).nome;
                  this.user.foto = JSON.parse(JSON.stringify(data)).foto;
                }
                else if(err.status === 404){
                  this.user.nome = JSON.parse(JSON.stringify(data)).nome;
                  this.user.foto = this.avatar;
                }
                // console.log(err);
              }
            )
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
            else {
              loader.dismiss()
            }
          });
        });
      }
      };

      check(img){
        return this.http.get(img);
      }
  
      imagem(){
        this.camera.getPicture({
          cameraDirection: 1,
          correctOrientation: true,
          quality: 30,
          destinationType: this.camera.DestinationType.DATA_URL,
          sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
          encodingType: this.camera.EncodingType.JPEG,
          saveToPhotoAlbum: true
        }).then(imageData => {
          this.myPhoto = imageData;
          this.myPhoto2 = 'data:image/jpeg;base64,' + imageData;
          this.uploadPhoto();
        }, error => {
          console.log("ERROR -> " + JSON.stringify(error));
        });
      }
    
      private uploadPhoto(): void {
        this.loader = this.loadingCtrl.create({
          content: 'Preparando imagem...'
        });
    
        this.loader.present();
    
        this.myPhotosRef.child(this.generateUUID()).child('myPhoto.jpeg')
          .putString(this.myPhoto, 'base64', { contentType: 'image/jpeg' })
          .then((savedPicture) => {
            this.myPhotoURL = savedPicture.downloadURL;
            this.postar();
          });
      }
    
      postar(){
        console.log(this.myPhotoURL);
        console.log(this.userId);
        this.afDB.object('Usuarios/' + this.userId).update({
          foto: this.myPhotoURL
        })
        .then(() => {
          this.loader.dismiss();
          this.navCtrl.setRoot(this.navCtrl.getActive().component);
        })
        .catch(() =>{
          this.loader.dismiss();
        })
      }
    
      private generateUUID(): any {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
      }

  save(val){
    this.userId = val;
  }

  fechar(){
    this.view.dismiss()
  }

  logout(){
    this.storage.set('logadoAlbum', 'nao');
    this.app.getRootNav().setRoot(LoginPage);
  }

  //Create chat
  chat(){
    this.storage.get('uid').then((val) => {
      let friendUser = this.userUid;
      console.log(val);
      let currentUser = val;

      let modal = this.modalCtrl.create(ChatPage, {currentUser: currentUser, friendUser: friendUser, friendInfo: this.user});
      modal.present();
    })
  }

  conversas(){
    this.storage.get('uid').then((val) => {
    let modal = this.modalCtrl.create(MensagensPage, {uid: val});
      modal.present();
    })
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
    this.userId = val;
    let loader = this.loadingCtrl.create({
    });
    loader.present();
    //Pegar figurinhas que já tem
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    //Request usuario
    let url2 = 'https://app-album.firebaseio.com/Usuarios/' + val + '.json';
    this.http.get(url2, { headers: headers }).subscribe(data => {
      if(data != null){
        if((JSON.parse(JSON.stringify(data)).total != null) && (JSON.parse(JSON.stringify(data)).total != undefined)){

          this.check(JSON.parse(JSON.stringify(data)).foto).subscribe((res) => {
          },
          err => {
            if(err.status === 200){
              this.user.nome = JSON.parse(JSON.stringify(data)).nome;
              this.user.foto = JSON.parse(JSON.stringify(data)).foto;
            }
            else if(err.status === 404){
              this.user.nome = JSON.parse(JSON.stringify(data)).nome;
              this.user.foto = this.avatar;
            }
            // console.log(err);
          })
          this.totalFigurinhas = JSON.parse(JSON.stringify(data)).total;
        }
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
     },

     err => {

     },

     () => {
      this.repetidas.sort(function(a, b) { 
        return - ( a.num - b.num );
      }).reverse();
     }
    );

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
        loader.dismiss()
      }
    });
  }

}
