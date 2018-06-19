import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'page-conta',
  templateUrl: 'conta.html',
})
export class ContaPage {

  conta = {
    name: '',
    email: '',
    senha: ''
  };
  login = {
    email: '',
    senha: '',
  }
  entrar = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController
  ) {
  }

  ionViewDidLoad() {
  }

  criar(){
    let loader = this.loadingCtrl.create({
    });
    loader.present();

    if(
      (this.conta.name != '') &&
      (this.conta.email != '') &&
      (this.conta.senha) 
    ) {
      this.afAuth.auth.createUserWithEmailAndPassword(this.conta.email, this.conta.senha)
      .then((res) => {
        loader.dismiss();
        let data = {
          name: this.conta.name,
          uid: res.uid,
          criou: 'sim'
        };
        this.viewCtrl.dismiss(data);
      })
      .catch(() => {
        loader.dismiss();
        let alert = this.alertCtrl.create({
          title: 'Ops!',
          subTitle: 'Não foi possível criar sua conta. Por favor, tente novamente.',
          buttons: ['Voltar']
        });
        alert.present();
      })
    }
    else {
      loader.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Ops!',
        subTitle: 'Antes de continuar, preencha todos os campos.',
        buttons: ['Voltar']
      });
      alert.present();
    }
  }

  fazerLogin(){
      let loader = this.loadingCtrl.create({
      });
      loader.present();
      
      this.afAuth.auth.signInWithEmailAndPassword(this.login.email, this.login.senha)
      .then((res) => {
        loader.dismiss();
        let data = {
          uid: res.uid,
          login: 'sim'
        };
        this.viewCtrl.dismiss(data);
      })
      .catch(() => {
        loader.dismiss();
        let alert = this.alertCtrl.create({
          title: 'Ops!',
          subTitle: 'Ocorreu um erro. Por favor, tente novamente.',
          buttons: ['Voltar']
        });
        alert.present();
      })
  }

  mudar(){
    if(this.entrar){
      this.entrar = false;
    }
    else{
      this.entrar = true;
    }
  }

}
