export const sphere_vertex = /* glsl */`
#include <noise>
#include <sdf>

#include <lighting_vert>

varying float noise_value;

uniform vec3 gravity_points[GRAVITY_POINTS_COUNT];
uniform float time;

void main()
{
  lighting_vert_inf vert_inf = lighting_vert();


  vec4 worldPos = (modelMatrix * vec4(position, 1.0));
  
  float noise_speed = 0.1;
  float noise_freq = 4.0;
  float noise_strength = 1.0;

  float min_dist = 0.2;
  float max_dist = 4.5;

  vec3 pull = vec3(0);
  for (int i = 0; i < GRAVITY_POINTS_COUNT; i++) {
    float dist = distance(worldPos.xyz, gravity_points[i]);
    dist = smoothstep(max_dist, min_dist, dist);

    worldPos = vec4(mix(worldPos.xyz, gravity_points[i], dist), worldPos.w);
  }

  //gl_Position = vec4(vert_inf.position.xyz, vert_inf.position.w);
  gl_Position = projectionMatrix * modelViewMatrix * worldPos;
}
`


export const sphere_fragment = /* glsl */`

#include <lighting_frag>

varying float noise_value;

uniform float time;

void main()
{
  lighting_frag_inf frag_inf = lighting_frag();

  vec3 noise_color = vec3(0.32156863, 0.14117647, 0.74117647);
  vec3 main_col = vec3(0.13333333, 0.07843137, 0.25882353);

  vec3 o = mix(main_col, noise_color, noise_value * 5.0);

  gl_FragColor = frag_inf.fragcolor * vec4(o, 1.0);
} 
`