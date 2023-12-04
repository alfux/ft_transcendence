import { Animation } from "./Animations"

interface Part {
    timestamp: number,
    action?:() => void
    animation?:Animation<any>
}

export class Sequence {
    
    parts: Part[] = []
    private timeouts:NodeJS.Timeout[] = []

    onStart?: () => void
    onFinish?: () => void

    running:boolean = false

    constructor(params: {
        onStart?: () => void,
        onFinish?: () => void,
    }) {
        this.onStart = params.onStart
        this.onFinish = params.onFinish
    }

    append(time:number, event:(()=>void)|Animation<any>) {
        if (event instanceof Animation)
            this.parts.push({timestamp:time, animation:event })
        else
            this.parts.push({timestamp:time, action:event })
    }

    start() {
        if (!this.running) {
            this.running = true
            this.onStart?.()

            this.parts.sort((a, b) => a.timestamp - b.timestamp)
            this.parts.forEach((v) => {
                this.timeouts.push(setTimeout(() => {
                    v.animation?.start()
                    v.action?.()
                }, v.timestamp))
            })
        }
    }

    stop() {
        if (this.running) {
          this.running = false
          this.timeouts.forEach((v) => clearTimeout(v))
          this.timeouts.splice(0)
        }
    }
    
    finish() {
        this.onFinish?.()
        this.stop()
    }

}