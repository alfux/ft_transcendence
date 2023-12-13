export const sdf = /* glsl */`
float sdfPlane( vec3 p, vec4 n )
{
  return dot(p,n.xyz) + n.w;
}
`