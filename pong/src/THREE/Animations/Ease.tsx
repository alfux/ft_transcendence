/*
import re
import re
with open('src/Animations/Ease.tsx', 'r') as f:
  content = f.read()
matches = re.findall(r'  (.*):\s\(t,\sd,\sos,\sper\)', content)
print('type EaseDict = {')
for m in matches:
  print(f'  {m}:EaseFunction')
print('}')
*/

const PI_over_2 = Math.PI / 2
const two_PI = Math.PI * 2

function BounceEaseOut(t: number, d: number, os: number, per: number) {
  if ((t /= d) < (1 / 2.75)) {
    return (7.5625 * t * t)
  }
  if (t < (2 / 2.75)) {
    return (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75)
  }
  if (t < (2.5 / 2.75)) {
    return (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375)
  }
  return (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375)
}
function BounceEaseIn(t: number, d: number, os: number, per: number) {
  return 1 - BounceEaseOut(d - t, d, -1, -1)
}

type EaseDict = {
  Linear: EaseFunction
  InSine: EaseFunction
  OutSine: EaseFunction
  InOutSine: EaseFunction
  InQuad: EaseFunction
  OutQuad: EaseFunction
  InOutQuad: EaseFunction
  InCubic: EaseFunction
  OutCubic: EaseFunction
  InOutCubic: EaseFunction
  InQuart: EaseFunction
  OutQuart: EaseFunction
  InOutQuart: EaseFunction
  InQuint: EaseFunction
  OutQuint: EaseFunction
  InOutQuint: EaseFunction
  InExpo: EaseFunction
  OutExpo: EaseFunction
  InOutExpo: EaseFunction
  InCirc: EaseFunction
  OutCirc: EaseFunction
  InOutCirc: EaseFunction
  InElastic: EaseFunction
  OutElastic: EaseFunction
  InOutElastic: EaseFunction
  InBack: EaseFunction
  OutBack: EaseFunction
  InOutBack: EaseFunction
  InBounce: EaseFunction
  OutBounce: EaseFunction
  InOutBounce: EaseFunction

  Default: EaseFunction
}

export type EaseFunction = (t: number, d: number, os: number, per: number) => number
export const Ease: EaseDict =
{
  Linear: (t, d, os, per) => { return t / d },

  InSine: (t, d, os, per) => { return (-Math.cos(t / d * PI_over_2) + 1) },
  OutSine: (t, d, os, per) => { return (Math.cos(t / d * PI_over_2)) },
  InOutSine: (t, d, os, per) => { return (-0.5 * (Math.cos(Math.PI * t / d) - 1)) },

  InQuad: (t, d, os, per) => { return (t /= d) * t },
  OutQuad: (t, d, os, per) => { return -(t /= d) * (t - 2) },
  InOutQuad: (t, d, os, per) => { return ((t /= d * 0.5) < 1) ? 0.5 * t * t : -0.5 * ((--t) * (t - 2) - 1) },

  InCubic: (t, d, os, per) => { return (t /= d) * t * t },
  OutCubic: (t, d, os, per) => { return (t = t / d - 1) * t * t + 1 },
  InOutCubic: (t, d, os, per) => { return ((t /= d * 0.5) < 1) ? (0.5 * t * t * t) : 0.5 * ((t -= 2) * t * t + 2) },

  InQuart: (t, d, os, per) => { return (t /= d) * t * t * t },
  OutQuart: (t, d, os, per) => { return -((t = t / d - 1) * t * t * t - 1) },
  InOutQuart: (t, d, os, per) => { return ((t /= d * 0.5) < 1) ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2) },

  InQuint: (t, d, os, per) => { return (t /= d) * t * t * t * t },
  OutQuint: (t, d, os, per) => { return ((t = t / d - 1) * t * t * t * t + 1) },
  InOutQuint: (t, d, os, per) => { return ((t /= d * 0.5) < 1) ? 0.5 * t * t * t * t * t : -0.5 * ((t -= 2) * t * t * t * t - 2) },


  InExpo: (t, d, os, per) => { return (t == 0) ? 0 : 2 ^ (10 * (t / d - 1)) },
  OutExpo: (t, d, os, per) => { return (t == 1) ? 1 : 1 - 2 ^ (-10 * t) },
  InOutExpo: (t, d, os, per) => {
    if ((t /= d * 0.5) < 1) {
      if (t === 0) return 0
      return 0.5 * -(2 ^ (-10 * --t) + 2)
    }
    else {
      if (t === d) return 1
      return 0.5 * 2 ^ (10 * (t - 1))
    }
  },

  InCirc: (t, d, os, per) => { return -(Math.sqrt(1 - (t /= d) * t) - 1) },
  OutCirc: (t, d, os, per) => { return Math.sqrt(1 - (t = t / d - 1) * t) },
  InOutCirc: (t, d, os, per) => { return ((t /= d * 0.5) < 1) ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1) },

  InElastic: (t, d, os, per) => {
    var s0
    if (t == 0) return 0
    if ((t /= d) == 1) return 1
    if (per == 0) per = d * 0.3
    if (os < 1) {
      os = 1
      s0 = per / 4
    } else s0 = per / two_PI * Math.asin(1 / os)
    return -(os * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s0) * two_PI / per))
  },
  OutElastic: (t, d, os, per) => {
    var s1
    if (t == 0) return 0
    if ((t /= d) == 1) return 1
    if (per == 0) per = d * 0.3
    if (os < 1) {
      os = 1
      s1 = per / 4
    } else s1 = per / two_PI * Math.asin(1 / os)
    return (os * Math.pow(2, -10 * t) * Math.sin((t * d - s1) * two_PI / per) + 1)
  },
  InOutElastic: (t, d, os, per) => {
    var s
    if (t == 0) return 0
    if ((t /= d * 0.5) == 2) return 1
    if (per == 0) per = d * (0.3 * 1.5)
    if (os < 1) {
      os = 1
      s = per / 4
    } else s = per / two_PI * Math.asin(1 / os)
    if (t < 1) return -0.5 * (os * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * two_PI / per))
    return os * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * two_PI / per) * 0.5 + 1
  },

  InBack: (t, d, os, per) => { return (t /= d) * t * ((os + 1) * t - os) },
  OutBack: (t, d, os, per) => { return ((t = t / d - 1) * t * ((os + 1) * t + os) + 1) },
  InOutBack: (t, d, os, per) => {
    if ((t /= d * 0.5) < 1) return 0.5 * (t * t * (((os *= (1.525)) + 1) * t - os))
    return 0.5 * ((t -= 2) * t * (((os *= (1.525)) + 1) * t + os) + 2)
  },
  InBounce: (t, d, os, per) => { return BounceEaseIn(t, d, os, per) },
  OutBounce: (t, d, os, per) => { return BounceEaseOut(t, d, os, per) },
  InOutBounce: (t, d, os, per) => { return ((t /= d * 0.5) < 1) ? BounceEaseIn(t * 2, d, -1, -1) * 0.5 : BounceEaseOut(t * 2 - d, d, -1, -1) * 0.5 + 0.5 },

  Default: (t, d, os, per) => { return -(t /= d) * (t - 2) }
}