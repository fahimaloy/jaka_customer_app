import { describe, it, expect, vi } from 'vitest'

vi.mock('@ionic/vue', () => ({
  toastController: { create: vi.fn() },
  alertController: { create: vi.fn() },
}))

import { toastController } from '@ionic/vue'
import { handleError } from '../lib/errorHandler'

describe('handleError', () => {
  it('shows a toast with the error message', async () => {
    const present = vi.fn()
    ;(toastController.create as any).mockResolvedValue({ present })
    await handleError(new Error('boom'))
    expect(toastController.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'boom' }),
    )
    expect(present).toHaveBeenCalled()
  })
})
