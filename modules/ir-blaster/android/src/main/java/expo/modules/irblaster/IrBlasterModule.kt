package expo.modules.irblaster

import android.content.Context
import android.hardware.ConsumerIrManager
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class IrBlasterModule : Module() {
  private val irManager: ConsumerIrManager?
    get() = appContext.reactContext
      ?.getSystemService(Context.CONSUMER_IR_SERVICE) as? ConsumerIrManager

  override fun definition() = ModuleDefinition {
    Name("IrBlaster")

    Function("hasIrEmitter") {
      irManager?.hasIrEmitter() == true
    }

    // Runs on a background queue: ConsumerIrManager.transmit blocks until the
    // whole pattern has been sent.
    AsyncFunction("transmit") { frequency: Int, pattern: IntArray ->
      val manager = irManager
      if (manager == null || !manager.hasIrEmitter()) {
        throw NoIrEmitterException()
      }
      manager.transmit(frequency, pattern)
    }
  }
}

class NoIrEmitterException :
  CodedException("ERR_NO_IR_EMITTER", "This device has no IR blaster", null)
