export const spin_vertex = /* glsl */`
#include <lighting_vert>

uniform float time;
uniform float spin;

uniform float spin_height;
uniform float noise_freq;

uniform vec3 spin_color;
uniform float max_alpha;

varying vec4 vWorldPos;

mat3 rotY(float a) {
  float s = sin(a);
  float c = cos(a);

  return mat3(
    c, -s, 0,
    s, c,  0,
    0, 0,  noise_freq
  );

}

void main()
{
  lighting_vert_inf vert_inf = lighting_vert();

  vWorldPos = vec4(rotY(time * spin * 7.0) * position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`


export const spin_fragment = /* glsl */`
#include <noise>

#include <lighting_frag>

uniform float time;
uniform float spin;
uniform float spin_height;

uniform vec3 spin_color;
uniform float max_alpha;

varying vec4 vWorldPos;

void main()
{
  lighting_frag_inf frag_inf = lighting_frag();

  float n = pnoise3(vWorldPos.xyz) + 0.5; //pnoise3 range = [???;???]
  n = smoothstep(0.2, 1.0, n);

  //up = +z
  float a = mix(0.0, n, -vWorldPos.z + spin_height) * mix(0.0, n, vWorldPos.z + spin_height); //worldpos.z = range [-0.5;0.5] (je crois)

  float spin_a = smoothstep(0.25, 1.0, abs(spin));
  a = mix(0.0, a, spin_a);

//frag_inf.fragcolor
  gl_FragColor = frag_inf.fragcolor*vec4(spin_color*n, min(a, max_alpha));
}
`