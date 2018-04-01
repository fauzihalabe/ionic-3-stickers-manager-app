import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { AlbumPage } from '../album/album';
import { RankingPage } from '../ranking/ranking';
import { PerfilPage } from '../perfil/perfil';
import { EventosPage } from '../eventos/eventos';
import { RepetidasPage } from '../repetidas/repetidas';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab2Root = RankingPage;
  tab3Root = AlbumPage;
  tab4Root = PerfilPage;
  tab5Root = EventosPage;
  tab6Root = RepetidasPage;

  constructor(private navCtrl: NavController) {

  }

}
