import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, limit, query, startAfter, where } from '@angular/fire/firestore';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.page.html',
  styleUrls: ['./cliente-list.page.scss'],
})
export class ClienteListPage implements OnInit {

  constructor(private readonly firestore: Firestore) { }

  listaCliente = new Array();
  maxResults = 10;
  ultimoClienteRecuperado: any = null;
  isSearch: boolean = false;
  query = "";
  registrosCargados = false;

  ngOnInit() {
    if (!this.registrosCargados) {
      this.listarCliente();
    }
  }

  ionViewWillEnter() {
    this.listaCliente = [];
    this.ultimoClienteRecuperado = null;
    this.listarCliente();
  }

  listarClienteSinFiltro = () => {
    const clienteRef = collection(this.firestore, 'cliente');

    let q;
    if (!this.ultimoClienteRecuperado) {
      q = query(clienteRef, limit(this.maxResults));
    } else {
      q = query(clienteRef, limit(this.maxResults), startAfter(this.ultimoClienteRecuperado));
    }
    getDocs(q).then(re => {
      let total = re.docs.length;

      if (!re.empty) {
        re.forEach(doc => {
          this.ultimoClienteRecuperado = re.docs[re.docs.length - 1];
          let cliente: any = doc.data();
          cliente.id = doc.id;

          this.listaCliente.push(cliente);
        });
      }
    });
  }

  listarCliente = () => {
    const clienteRef = collection(this.firestore, 'cliente');

    if ((this.query + "").length > 0) {
      let q = undefined;
      if (this.ultimoClienteRecuperado) {
        q = query(clienteRef,
          where("nombreape", ">=", this.query.toUpperCase()),
          where("nombreape", "<=", this.query.toLowerCase() + '\uf8ff'),
          limit(this.maxResults),
          startAfter(this.ultimoClienteRecuperado));
      } else {
        q = query(clienteRef,
          where("nombreape", ">=", this.query.toUpperCase()),
          where("nombreape", "<=", this.query.toLowerCase() + '\uf8ff'),
          limit(this.maxResults));
      }

      getDocs(q).then(re => {
        if (!re.empty) {
          let nuevoArray = new Array();

          for (let i = 0; i < re.docs.length; i++) {
            const doc: any = re.docs[i].data();
            if (doc.nombre.toUpperCase().startsWith(this.query.toUpperCase().charAt(0))) {
              nuevoArray.push(re.docs[i])
            }
          }

          this.ultimoClienteRecuperado = re.docs[nuevoArray.length - 1];
          for (let i = 0; i < nuevoArray.length; i++) {
            const doc: any = nuevoArray[i];
            let cliente: any = doc.data();
            cliente.id = doc.id;
            this.listaCliente.push(cliente);

          }

        }
      });

    } else {
      this.listarClienteSinFiltro();
    }

    this.registrosCargados = true; // Marcamos que los registros han sido cargados
  }

  onIonInfinite(ev: any) {
    this.listarCliente();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  clickSearch = () => {
    this.isSearch = true;
  }

  clearSearch = () => {
    this.isSearch = false;
    this.query = "";

    this.listaCliente = new Array();
    this.ultimoClienteRecuperado = null;
    this.registrosCargados = false; // Marcamos que los registros deben volver a cargarse
    this.listarCliente();
  }

  buscarSearch = (e: any) => {
    this.isSearch = false;
    this.query = e.target.value;

    this.listaCliente = new Array();
    this.ultimoClienteRecuperado = null;
    this.registrosCargados = false; // Marcamos que los registros deben volver a cargarse
    this.listarCliente();
  }

}
