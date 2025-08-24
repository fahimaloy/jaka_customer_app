import { toastController, alertController } from '@ionic/vue'

export async function handleError(error: unknown) {
  console.error(error)
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  try {
    const toast = await toastController.create({
      message,
      duration: 3000,
      color: 'danger',
    })
    await toast.present()
  } catch {
    const alert = await alertController.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    })
    await alert.present()
  }
}
