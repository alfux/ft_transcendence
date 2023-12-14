import * as THREE from "three"

import { sdf } from "./sdf.glsl"
import { noise } from "./noise.glsl";

import { lighting_vert, lighting_frag } from "./lighting.glsl";

export function init_modules()
{
    (THREE.ShaderChunk as any).sdf = sdf;
    (THREE.ShaderChunk as any).noise = noise;
    (THREE.ShaderChunk as any).lighting_vert = lighting_vert;
    (THREE.ShaderChunk as any).lighting_frag = lighting_frag;
}
