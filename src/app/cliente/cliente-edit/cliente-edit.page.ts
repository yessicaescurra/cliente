import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { collection, addDoc, updateDoc, Firestore, doc, getDoc, deleteDoc, Timestamp } from '@angular/fire/firestore';
import { getDownloadURL, uploadBytesResumable, Storage, ref, deleteObject } from '@angular/fire/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cliente-edit',
  templateUrl: './cliente-edit.page.html',
  styleUrls: ['./cliente-edit.page.scss'],
})
export class ClienteEditPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  id: any;  //atributo que recibe el id del reg. desde la ruta
  isNew: boolean = false;
  cliente: any = {};
  fecha: Date = new Date();

  constructor(
    private readonly firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private storage: Storage
  ) { }

  //metodo de la interfaz OnInit
  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      console.log("params", params);
      this.id = params.id;
      if (params.id == 'new') {
        this.isNew = true;
      } else {
        this.obtenerCliente(this.id);
      }
    });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  
  editarCliente = () => {
    console.log("Aqui editar en firebase");
    const document = doc(this.firestore, "cliente", this.id);

    updateDoc(document, {
      nombreape: this.cliente.nombreape,
      fecha : new Date(this.cliente.fecha),
      bienase: this.cliente.bienase,
      monto: this.cliente.monto,
    }).then(() => {
      console.log("Registro Editado");
      this.presentSuccessAlert();
      this.router.navigate(['/cliente-list']);
    }).catch(error => {
      console.error("Error al editar el registro", error);
    });

  }

  //Mensaje de que ha guardado
  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Guardada con éxito',
      buttons: ['OK']
    });

    await alert.present();
  }

  guardarCliente() {
    if (this.validarCampos()) {
      if (this.isNew) {
        this.incluirCliente();
      } else {
        this.editarCliente();
      }
    } else {
      let errorMessage = '';
      if (!this.cliente.nombreape || !this.cliente.fecha || !this.cliente.bienase || !this.cliente.monto ) {
        errorMessage = 'Por favor, complete todos los campos.';
      } else if (!(/^\d+$/.test(this.cliente.monto))) {
        errorMessage = 'El valor del monto asgurado debe ser positivo';
      } else if (parseInt(this.cliente.monto) < 0) {
        errorMessage = 'El código debe ser un número positivo.';
      }
      // Mostrar mensaje de error
      this.presentErrorAlert(errorMessage);
    }
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error al guardar',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  validarCampos(): boolean {
    return this.cliente.nombreape && this.cliente.fecha && this.cliente.bienase && /^\d+$/.test(this.cliente.monto);
  }

  isValidForm(): boolean {
    return this.cliente.nombreape && this.cliente.fecha && this.cliente.bienase && /^\d+$/.test(this.cliente.monto);
  }

  incluirCliente = () => {
    console.log("Aqui incluir en firebase");
    let clienteRef = collection(this.firestore, "cliente");
  
    addDoc(clienteRef, {
      nombreape: this.cliente.nombreape,
      fecha : new Date(this.cliente.fecha),
      bienase: this.cliente.bienase,
      monto: this.cliente.monto
    }).then((docRef) => {
      console.log("Registro Incluido con ID:", docRef.id);
      this.id = docRef.id;
      this.presentSuccessAlert();
      this.router.navigate(['/cliente-list']);
    }).catch(error => {
      console.error("Error al incluir cliente:", error);
    });
  }
  
  async eliminarCliente() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de eliminar este registro?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí',
          handler: () => {
            // Eliminar el registro
            this.eliminarRegistro();
          }
        }
      ]
    });

    await alert.present();
  }

  eliminarRegistro() {
    console.log("Aqui eliminar en firebase");
    const document = doc(this.firestore, "cliente", this.id);

    deleteDoc(document).then(() => {
      console.log("Registro Eliminado");
      this.router.navigate(['/cliente-list']);
    }).catch(error => {
      console.error('Error al eliminar cliente:', error);
    });
  }

  obtenerCliente = (id: string) => {
    const document = doc(this.firestore, "cliente", id);
    getDoc(document).then(doc => {
      console.log("Registro a editar", doc.data());
      if (doc.data()) {
        this.cliente = doc.data();

        this.cliente.fecha = this.cliente.fecha.toDate()?.toISOString()
        .substring(0, 10)+"";
      }
    }).catch(error => {
      console.error("Error al obtener cliente", error);
    });
  }

}
