import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import CryptoVault from '../ABI/CryptoVault.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

@Component({
  selector: 'app-metamask',
  templateUrl: './metamask.component.html',
  styleUrls: ['./metamask.component.css']
})
export class MetamaskComponent implements OnInit {
  account: string | null = null;
  balance: string | null = null;
  contractBalance: string | null = null;
  network: string = '1'; // Red principal por defecto
  provider: ethers.BrowserProvider | null = null;
  contract: ethers.Contract | null = null;
  recipientAddress: string = '';
  amount: number = 0;
  transactionMessage: string = '';
  selectedNetwork: string = '1';
  showForm: boolean = false; // Controla la visibilidad del formulario

  // Dirección del contrato en la blockchain
  contractAddress = '0x91f1d8111b87a7974a850cff9dfc46ad7f3be76c';

  constructor() {}

  ngOnInit(): void {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
    } else {
      console.log('MetaMask is not installed');
    }
  }

  async connectWallet(): Promise<void> {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
  
      // Crear el proveedor y obtener el signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      this.account = await signer.getAddress();
      console.log('Connected address:', this.account);
  
      // Obtener el balance de la cuenta conectada
      if (this.provider && this.account) {
        const balanceInWei = await this.provider.getBalance(this.account as string);
        this.balance = parseFloat(ethers.formatEther(balanceInWei)).toFixed(4);
      }
  
      // Detectar la red en la que se encuentra al conectar
      const network = await this.provider.getNetwork();
      this.network = network.chainId.toString();  // Sincronizar el select con la red actual
      console.log('Red actual:', this.network);
  
      // Escuchar eventos de cambio de red
      window.ethereum.on('chainChanged', (chainId: string) => {
        this.network = parseInt(chainId, 16).toString();  // Actualizar el select
        this.connectWallet();  // Reconectar para actualizar los datos
        console.log('Cambio de red detectado:', this.network);
      });
  
      // Instanciar el contrato
      this.contract = new ethers.Contract(this.contractAddress, CryptoVault, signer);
  
    } catch (error) {
      console.error('Error connecting to MetaMask', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo conectar a MetaMask. Asegúrate de que MetaMask esté instalado y autorizado.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }  

  async transferFunds(to: string, amount: number, network: string): Promise<void> {
    if (!this.contract) {
      console.error("Contract not loaded.");
      return;
    }

    // Advertencia para Sepolia
    if (network === '11155111') {
      this.transactionMessage = 'Advertencia: La red Sepolia no es compatible para enviar fondos en este momento.';
      Swal.fire({
          title: 'Advertencia',
          text: this.transactionMessage,
          icon: 'warning',
          confirmButtonText: 'Aceptar'
      });
      return; // Si se selecciona Sepolia, no proceder con la transferencia
    }

    // Verificar la red actual
    const currentNetwork = await this.provider?.getNetwork();
    if (currentNetwork && currentNetwork.chainId !== BigInt(network)) {
      this.transactionMessage = `Error: La red actual es ${currentNetwork.chainId}, pero seleccionaste ${network}. Por favor cambia la red.`;
      console.error(this.transactionMessage);
      return;
    }

    // Confirmación de la transacción
    const confirmResult = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres enviar ${amount} ETH a ${to}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) {
      return; // Si el usuario cancela, no hacemos nada
    }

    const amountInWei = ethers.parseEther(amount.toString()); // Convertir a Wei
    try {
      const transaction = await this.contract["transferFunds"](to, amountInWei, { value: amountInWei });
      await transaction.wait(); // Esperar a que se confirme la transacción

      // Actualizar saldo
      if (this.provider && this.account) {
        const balanceInWei = await this.provider.getBalance(this.account as string);
        this.balance = parseFloat(ethers.formatEther(balanceInWei)).toFixed(4); // Actualizar saldo después de la transacción
      } else {
        console.error('Provider o cuenta no disponible.');
      }

      // Mensaje de éxito
      Swal.fire({
        title: 'Transacción exitosa',
        text: `${amount} ETH enviados a ${to}`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });

      console.log(`Transferred ${amount} ETH to ${to}`);
      this.transactionMessage = `Transacción exitosa: ${amount} ETH enviados a ${to}`;

      // Reiniciar el formulario
      this.recipientAddress = ''; // Limpiar dirección del destinatario
      this.amount = 0; // Reiniciar monto
      this.selectedNetwork = '1'; // Restablecer a Mainnet

    } catch (error) {
      console.error('Error transferring funds', error);
      this.transactionMessage = "Error durante la transferencia. Por favor, revisa los detalles.";
    }
  } 

  async changeNetwork(event: Event): Promise<void> {
    const networkId = (event.target as HTMLSelectElement).value;
    this.network = networkId;
  
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(networkId).toString(16)}` }],
      });
      this.connectWallet(); // Reconectar para obtener balances actualizados
  
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${parseInt(networkId).toString(16)}`,
                chainName: 'Custom Network',
                rpcUrls: ['https://your-custom-rpc-url.com'],
              },
            ],
          });
          this.connectWallet();
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      } else {
        console.error('Error changing network:', error);
        Swal.fire({
          title: 'Error',
          text: `Error al cambiar la red a ${networkId}. Intenta de nuevo.`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    }
  }  

  async copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        // Mensaje de éxito con SweetAlert
        await Swal.fire({
            title: '¡Éxito!',
            text: 'La dirección ha sido copiada correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            showCancelButton: false,
            confirmButtonColor: '#3085d6'
        });
    } catch (err) {
        console.error('Error al copiar al portapapeles: ', err);
        // Mensaje de error con SweetAlert
        await Swal.fire({
            title: 'Error',
            text: 'No se pudo copiar la dirección.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            showCancelButton: false,
            confirmButtonColor: '#d33'
        });
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm; // Alternar la visibilidad del formulario
  }

}
