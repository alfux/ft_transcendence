import * as THREE from 'three'
import { ShaderChunk } from 'three';
import { PackedPhongMaterial } from 'three/examples/jsm/utils/PackedPhongMaterial'

export const lighting_vert = /* glsl */`

#undef gl_FragColor
#define gl_FragColor _OUT_COLOR

#undef gl_FragDepthEXT
#define gl_FragDepthEXT _OUT_FRAG_DEPTH_EXT

#define gl_FragDepth _OUT_FRAG_DEPTH

#undef gl_Position
#define gl_Position _OUT_POSITION

#define PHONG

varying vec3 vViewPosition;

#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#ifdef USE_PACKED_NORMAL
    #if USE_PACKED_NORMAL == 0
      vec3 decodeNormal(vec3 packedNormal)
      {
        float x = packedNormal.x * 2.0 - 1.0;
        float y = packedNormal.y * 2.0 - 1.0;
        vec2 scth = vec2(sin(x * PI), cos(x * PI));
        vec2 scphi = vec2(sqrt(1.0 - y * y), y);
        return normalize( vec3(scth.y * scphi.x, scth.x * scphi.x, scphi.y) );
      }
    #endif

    #if USE_PACKED_NORMAL == 1
      vec3 decodeNormal(vec3 packedNormal)
      {
        vec3 v = vec3(packedNormal.xy, 1.0 - abs(packedNormal.x) - abs(packedNormal.y));
        if (v.z < 0.0)
        {
          v.xy = (1.0 - abs(v.yx)) * vec2((v.x >= 0.0) ? +1.0 : -1.0, (v.y >= 0.0) ? +1.0 : -1.0);
        }
        return normalize(v);
      }
    #endif

    #if USE_PACKED_NORMAL == 2
      vec3 decodeNormal(vec3 packedNormal)
      {
        vec3 v = (packedNormal * 2.0) - 1.0;
        return normalize(v);
      }
    #endif
  #endif

#ifdef USE_PACKED_POSITION
#if USE_PACKED_POSITION == 0
  uniform mat4 quantizeMatPos;
#endif
#endif

#ifdef USE_PACKED_UV
#if USE_PACKED_UV == 1
  uniform mat3 quantizeMatUV;
#endif
#endif

#ifdef USE_PACKED_UV
#if USE_PACKED_UV == 0
  vec2 decodeUV(vec2 packedUV)
  {
    vec2 uv = (packedUV * 2.0) - 1.0;
    return uv;
  }
#endif

#if USE_PACKED_UV == 1
  vec2 decodeUV(vec2 packedUV)
  {
    vec2 uv = ( vec3(packedUV, 1.0) * quantizeMatUV ).xy;
    return uv;
  }
#endif
#endif


struct lighting_vert_inf
{
    vec4 fragcolor;
    float fragdepth_ext;
    float fragdepth;
    vec4 position;
};

lighting_vert_inf lighting_vert() {

  vec4 gl_FragColor;
  float gl_FragDepthEXT;
  float gl_FragDepth;
  vec4 gl_Position;

	#include <uv_vertex>

  #ifdef USE_MAP
    #ifdef USE_PACKED_UV
      vMapUv = decodeUV(vMapUv);
    #endif
  #endif

	#include <color_vertex>
	#include <morphcolor_vertex>

  #ifdef USE_PACKED_NORMAL
    objectNormal = decodeNormal(objectNormal);
  #endif

  #ifdef USE_TANGENT
    vec3 objectTangent = vec3( tangent.xyz );
  #endif

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>

  #ifdef USE_PACKED_POSITION
    #if USE_PACKED_POSITION == 0
      transformed = ( vec4(transformed, 1.0) * quantizeMatPos ).xyz;
    #endif
  #endif

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

    lighting_vert_inf inf;
    inf.fragcolor = gl_FragColor;
    inf.fragdepth_ext = gl_FragDepthEXT;
    inf.fragdepth = gl_FragDepth;
    inf.position = gl_Position;
    return inf;
}

#undef gl_FragColor
#undef gl_FragDepthEXT
#undef gl_FragDepth
#undef gl_Position

#define gl_FragColor pc_fragColor
#define gl_FragDepthEXT gl_FragDepth


`;






export const lighting_frag = /* glsl */`

#undef gl_FragColor
#define gl_FragColor _OUT_COLOR

#undef gl_FragDepthEXT
#define gl_FragDepthEXT _OUT_FRAG_DEPTH_EXT

#define gl_FragDepth _OUT_FRAG_DEPTH

#undef gl_Position
#define gl_Position _OUT_POSITION

#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

struct lighting_frag_inf
{
    vec4 fragcolor;
    float fragdepth_ext;
    float fragdepth;
    vec4 position;
};

lighting_frag_inf lighting_frag() {

  vec4 gl_FragColor;
  float gl_FragDepthEXT;
  float gl_FragDepth;
  vec4 gl_Position;

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

  lighting_frag_inf inf;
  inf.fragcolor = gl_FragColor;
  inf.fragdepth_ext = gl_FragDepthEXT;
  inf.fragdepth = gl_FragDepth;
  inf.position = gl_Position;

  return inf;

}

#undef gl_FragColor
#undef gl_FragDepthEXT
#undef gl_FragDepth
#undef gl_Position

#define gl_FragColor pc_fragColor
#define gl_FragDepthEXT gl_FragDepth

`



export class CustomLightingShader extends PackedPhongMaterial {
  uniforms: any

  constructor(parameters: THREE.ShaderMaterialParameters) {
    super(parameters)

    this.uniforms = THREE.UniformsUtils.merge([
      THREE.ShaderLib.phong.uniforms,
      {
        quantizeMatPos: { value: null },
        quantizeMatUV: { value: null },
      },
      parameters.uniforms,
    ]);

	}
}